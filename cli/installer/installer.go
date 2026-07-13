package installer

import (
	"os"
	"path"

	"github.com/google/uuid"
	cp "github.com/otiai10/copy"
	"github.com/syncloud/golib/config"
	"github.com/syncloud/golib/linux"
	"github.com/syncloud/golib/platform"
	"go.uber.org/zap"
)

const (
	App       = "freshrss"
	AppDir    = "/snap/freshrss/current"
	DataDir   = "/var/snap/freshrss/current"
	CommonDir = "/var/snap/freshrss/common"
)

type Variables struct {
	App       string
	AppDir    string
	DataDir   string
	CommonDir string
	DataPath  string
	Url       string
	Domain    string
}

type Installer struct {
	newVersionFile     string
	currentVersionFile string
	configDir          string
	platformClient     *platform.Client
	executor           *Executor
	logger             *zap.Logger
}

func New(logger *zap.Logger) *Installer {
	return &Installer{
		newVersionFile:     path.Join(AppDir, "version"),
		currentVersionFile: path.Join(DataDir, "version"),
		configDir:          path.Join(DataDir, "config"),
		platformClient:     platform.New(),
		executor:           NewExecutor(logger),
		logger:             logger,
	}
}

func (i *Installer) Install() error {
	err := linux.CreateUser(App)
	if err != nil {
		return err
	}

	err = i.UpdateConfigs()
	if err != nil {
		return err
	}

	return i.FixPermissions()
}

func (i *Installer) Configure() error {
	if i.IsInstalled() {
		err := i.Upgrade()
		if err != nil {
			return err
		}
	} else {
		err := i.Initialize()
		if err != nil {
			return err
		}
	}

	err := i.FixPermissions()
	if err != nil {
		return err
	}

	return i.UpdateVersion()
}

func (i *Installer) Initialize() error {
	err := i.StorageChange()
	if err != nil {
		return err
	}

	return i.InstallFreshRss()
}

func (i *Installer) Upgrade() error {
	return i.StorageChange()
}

func (i *Installer) IsInstalled() bool {
	dataPath, err := i.DataPath()
	if err != nil {
		return false
	}
	_, err = os.Stat(path.Join(dataPath, "config.php"))
	return err == nil
}

func (i *Installer) PreRefresh() error {
	return nil
}

func (i *Installer) PostRefresh() error {
	err := i.UpdateConfigs()
	if err != nil {
		return err
	}

	err = i.ClearVersion()
	if err != nil {
		return err
	}

	return i.FixPermissions()
}

func (i *Installer) StorageChange() error {
	storageDir, err := i.platformClient.InitStorage(App, App)
	if err != nil {
		return err
	}

	dataPath := path.Join(storageDir, "data")
	err = linux.CreateMissingDirs(
		dataPath,
		path.Join(dataPath, "cache"),
		path.Join(dataPath, "users"),
		path.Join(dataPath, "favicons"),
		path.Join(dataPath, "tokens"),
	)
	if err != nil {
		return err
	}

	return linux.Chown(storageDir, App)
}

func (i *Installer) DataPath() (string, error) {
	storageDir, err := i.platformClient.InitStorage(App, App)
	if err != nil {
		return "", err
	}
	return path.Join(storageDir, "data"), nil
}

func (i *Installer) ClearVersion() error {
	return os.RemoveAll(i.currentVersionFile)
}

func (i *Installer) UpdateVersion() error {
	return cp.Copy(i.newVersionFile, i.currentVersionFile)
}

func (i *Installer) UpdateConfigs() error {
	err := linux.CreateMissingDirs(path.Join(DataDir, "nginx"))
	if err != nil {
		return err
	}

	err = i.StorageChange()
	if err != nil {
		return err
	}

	dataPath, err := i.DataPath()
	if err != nil {
		return err
	}

	url, err := i.platformClient.GetAppUrl(App)
	if err != nil {
		return err
	}

	domain, err := i.platformClient.GetAppDomainName(App)
	if err != nil {
		return err
	}

	variables := Variables{
		App:       App,
		AppDir:    AppDir,
		DataDir:   DataDir,
		CommonDir: CommonDir,
		DataPath:  dataPath,
		Url:       url,
		Domain:    domain,
	}

	err = config.Generate(
		path.Join(AppDir, "config"),
		path.Join(DataDir, "config"),
		variables,
	)
	if err != nil {
		return err
	}

	return i.FixPermissions()
}

func (i *Installer) AccessChange() error {
	return i.UpdateConfigs()
}

func (i *Installer) FixPermissions() error {
	storageDir, err := i.platformClient.InitStorage(App, App)
	if err != nil {
		return err
	}

	err = linux.Chown(DataDir, App)
	if err != nil {
		return err
	}

	err = linux.Chown(CommonDir, App)
	if err != nil {
		return err
	}

	return linux.Chown(storageDir, App)
}

func (i *Installer) BackupPreStop() error {
	return i.PreRefresh()
}

func (i *Installer) RestorePreStart() error {
	return i.PostRefresh()
}

func (i *Installer) RestorePostStart() error {
	return i.Configure()
}

func getOrCreateUuid(file string) (string, error) {
	_, err := os.Stat(file)
	if os.IsNotExist(err) {
		secret := uuid.New().String()
		err = os.WriteFile(file, []byte(secret), 0644)
		return secret, err
	}
	content, err := os.ReadFile(file)
	if err != nil {
		return "", err
	}
	return string(content), nil
}

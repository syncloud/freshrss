package installer

import (
	"path"

	cp "github.com/otiai10/copy"
)

var seedFiles = []string{"config.custom.php", "config-user.custom.php", "opml.xml"}

func (i *Installer) InstallFreshRss() error {
	url, err := i.platformClient.GetAppUrl(App)
	if err != nil {
		return err
	}

	dataPath, err := i.DataPath()
	if err != nil {
		return err
	}

	for _, f := range seedFiles {
		err = cp.Copy(path.Join(DataDir, "config", f), path.Join(dataPath, f))
		if err != nil {
			return err
		}
	}

	_, err = i.freshRssCli(
		"./cli/do-install.php",
		"--default-user", "admin",
		"--auth-type", "http_auth",
		"--environment", "production",
		"--base-url", url,
		"--title", "Syncloud",
		"--db-type", "sqlite",
		"--api-enabled",
	)
	return err
}

func (i *Installer) freshRssCli(args ...string) (string, error) {
	fullArgs := append([]string{"-E", "-u", App, path.Join(AppDir, "bin/freshrss.sh")}, args...)
	return i.executor.Run("sudo", fullArgs...)
}

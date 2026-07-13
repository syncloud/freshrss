package installer

import (
	"path"
)

func (i *Installer) InstallFreshRss() error {
	url, err := i.platformClient.GetAppUrl(App)
	if err != nil {
		return err
	}

	_, err = i.freshRssCli(
		"./cli/do-install.php",
		"--default-user", "admin",
		"--auth-type", "form",
		"--environment", "production",
		"--base-url", url,
		"--title", "Syncloud",
		"--db-type", "sqlite",
		"--api-enabled",
	)
	if err != nil {
		return err
	}

	storageDir, err := i.platformClient.InitStorage(App, App)
	if err != nil {
		return err
	}

	password, err := getOrCreateUuid(path.Join(storageDir, "admin.password"))
	if err != nil {
		return err
	}

	_, err = i.freshRssCli(
		"./cli/create-user.php",
		"--user", "admin",
		"--password", password,
		"--api-password", password,
		"--language", "en",
	)
	return err
}

func (i *Installer) freshRssCli(args ...string) (string, error) {
	fullArgs := append([]string{"-E", "-u", App, path.Join(AppDir, "bin/freshrss.sh")}, args...)
	return i.executor.Run("sudo", fullArgs...)
}

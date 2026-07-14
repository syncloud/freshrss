package installer

import (
	"os"
	"path"
)

const customConfig = `<?php
return [
	'http_auth_auto_register' => true,
];
`

const customUserConfig = `<?php
return [
	'is_admin' => true,
];
`

const exampleOpml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
	<body>
		<outline text="Example Feeds" title="Example Feeds">
			<outline text="FreshRSS" title="FreshRSS" type="rss"
				xmlUrl="https://github.com/FreshRSS/FreshRSS/releases.atom"
				htmlUrl="https://freshrss.org/" />
		</outline>
	</body>
</opml>
`

func (i *Installer) InstallFreshRss() error {
	url, err := i.platformClient.GetAppUrl(App)
	if err != nil {
		return err
	}

	dataPath, err := i.DataPath()
	if err != nil {
		return err
	}

	err = os.WriteFile(path.Join(dataPath, "config.custom.php"), []byte(customConfig), 0644)
	if err != nil {
		return err
	}

	err = os.WriteFile(path.Join(dataPath, "config-user.custom.php"), []byte(customUserConfig), 0644)
	if err != nil {
		return err
	}

	err = os.WriteFile(path.Join(dataPath, "opml.xml"), []byte(exampleOpml), 0644)
	if err != nil {
		return err
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

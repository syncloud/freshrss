package main

import (
	"os"
	"os/exec"
	"path"
	"time"

	"go.uber.org/zap"
	"hooks/log"
)

const interval = 15 * time.Minute

func main() {
	logger := log.Logger(zap.DebugLevel)
	refresh := path.Join(os.Getenv("SNAP"), "bin", "freshrss.sh")
	for {
		time.Sleep(interval)
		logger.Info("refreshing feeds")
		cmd := exec.Command(refresh, "./app/actualize_script.php")
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		if err := cmd.Run(); err != nil {
			logger.Error("actualize failed", zap.Error(err))
		}
	}
}

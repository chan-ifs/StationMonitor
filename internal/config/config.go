package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

type Config struct {
	Server struct {
		Port string `yaml:"port"`
	} `yaml:"server"`
	MongoDB struct {
		URL string `yaml:"url"`
	} `yaml:"mongodb"`
	JWT struct {
		Secret string `yaml:"secret"`
	} `yaml:"jwt"`
	GoogleOAuth struct {
		ClientID     string `yaml:"client_id"`
		ClientSecret string `yaml:"client_secret"`
		RedirectURL  string `yaml:"redirect_url"`
	} `yaml:"google_oauth"`
}

func LoadConfig(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	var config Config
	if err := yaml.Unmarshal(data, &config); err != nil {
		return nil, fmt.Errorf("failed to parse config file: %w", err)
	}

	// Set defaults
	if config.Server.Port == "" {
		config.Server.Port = "8080"
	}

	if config.JWT.Secret == "" {
		config.JWT.Secret = "your-secret-key-change-in-production"
	}

	return &config, nil
}


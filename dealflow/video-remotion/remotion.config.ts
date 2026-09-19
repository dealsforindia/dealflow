import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setPixelFormat("yuv420p");
Config.setCodec("h264");

// Linux CI headless optimization for GitHub Actions
Config.setChromiumDisableWebSecurity(true);
Config.setChromiumHeadlessMode(true);
Config.setChromiumMultiProcessOnLinux(true);



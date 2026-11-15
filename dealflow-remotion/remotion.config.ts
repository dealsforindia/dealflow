import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setPixelFormat("yuv420p");
Config.setCodec("h264");
Config.setHardwareAcceleration("if-possible");
Config.setCrf(16);

// Chromium optimization for smooth rendering
Config.setChromiumDisableWebSecurity(true);
Config.setChromiumHeadlessMode(true);
Config.setChromiumMultiProcessOnLinux(true);



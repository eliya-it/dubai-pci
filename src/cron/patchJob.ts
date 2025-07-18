import cron from "node-cron";
import { exec } from "child_process";

cron.schedule(
  "0 3 * * 0",
  () => {
    console.log("[Patch Job] Running weekly patch script...");
    exec("bash patch.sh", (error, stdout, stderr) => {
      if (error) {
        console.error(`[Patch Job] Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`[Patch Job] stderr: ${stderr}`);
      }
      console.log(`[Patch Job] Output:\n${stdout}`);
    });
  },
  {
    timezone: "Etc/UTC",
  }
);

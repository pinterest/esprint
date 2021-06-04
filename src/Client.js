import jayson from "jayson";
import { ESLint } from "eslint";
import { clearLine } from "./cliUtils";

export default class Client {
  constructor(options) {
    this.options = options;
    this.eslint = new ESLint();
  }

  async connect() {
    const { port, formatter, maxWarnings } = this.options;

    const client = jayson.client.http({
      port,
    });

    const eslintFormatter = await this.eslint.loadFormatter(formatter);

    setInterval(() => {
      client.request("status", null, function (error, response) {
        if (error) {
          throw error;
        }
        const { result } = response;
        if (!result.message) {
          console.log(eslintFormatter.format(result.records));
          process.exit(
            result &&
              (result.errorCount > 0
                ? 1
                : 0 || result.warningCount > maxWarnings
                ? 1
                : 0)
          );
        } else {
          clearLine();
          process.stdout.write(result.message);
        }
      });
    }, 500);
  }
}

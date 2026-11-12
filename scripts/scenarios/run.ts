// Scenario runner for the article. Usage (local database only):
//   DATABASE_URL=postgresql://user@localhost:5432/db npm run test:scenarios
// It wipes every table before each scenario. The schema must already be migrated.
import { assertLocalDatabase } from "./guard";

const SCENARIO_ENV = {
    ENVIRONMENT: "test",                                  // signature checks ON
    CENTRALCART_WEBHOOK_SECRET: "scenario-test-secret",   // same value as harness.TEST_SECRET
    GOAL_TARGET_CENTS: "10000",                           // same value as harness.GOAL_TARGET_CENTS
}

async function main() {
    let databaseHost: string
    try {
        databaseHost = assertLocalDatabase()
    } catch (error) {
        console.error(`ABORTADO: ${error instanceof Error ? error.message : String(error)}`)
        process.exitCode = 1
        return
    }

    // Set before any project module loads, so these win over anything dotenv reads later.
    Object.assign(process.env, SCENARIO_ENV)

    const { runScenarios } = await import("./runner.js")
    const allPassed = await runScenarios(databaseHost)
    process.exitCode = allPassed ? 0 : 1
}

void main()

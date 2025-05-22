# finance-bot

finance-bot is a comprehensive finance portfolio management tool designed to help users manage their investments across multiple asset types including cryptocurrencies, stocks, and fixed income. It offers both a command-line interface (CLI) and a server mode with REST API endpoints, providing flexibility for different usage scenarios.

## Setup Instructions

### Prerequisites

- Node.js (version 16 or higher recommended)
- npm (comes with Node.js)
- MongoDB (for database storage)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/DiegoPinto357/finance-bot.git
   cd finance-bot
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory to configure environment variables as needed (e.g., database connection string, server port).

4. Build the project:
   ```bash
   npm run build
   ```

## Running the Application

### CLI Mode

Run CLI commands using:

```bash
npm run cli -- <context> <command> [options]
```

Supported contexts and example commands:

- `crypto`: Manage cryptocurrency assets
- `stock`: Manage stock assets
- `fixed`: Manage fixed income assets
- `portfolio`: Manage overall portfolio
- `process`: Run process scripts

Example:

```bash
npm run cli -- crypto list
```

### Server Mode

Start the server with:

```bash
npm run server
```

The server listens on port `3001` by default (configurable via the `PORT` environment variable).

The server exposes REST API endpoints for system, fixed income, stock, crypto, portfolio, and MCP modules.

## Features and Capabilities

- Modular CLI contexts for managing different asset types: crypto, stock, fixed income, portfolio, and process scripts.
- Express-based server providing REST API endpoints for all modules.
- Integration with multiple data providers including Binance, CoinMarketCap, MercadoBitcoin, Google Sheets, and more.
- MongoDB-backed database for portfolio and asset management.
- Cache layer for improved performance.
- Backup scheduler to ensure data safety and recovery.
- Support for automated scripts and portfolio operations.

## Testing

Run tests with:

```bash
npm run test
```

Generate test coverage report with:

```bash
npm run test:coverage
```

## Contributing

Issues and contributions are welcome. Please check the [issues](https://github.com/DiegoPinto357/finance-bot/issues) page for known bugs and feature requests.

## License

This project is licensed under the ISC License.

## Links

- Repository: https://github.com/DiegoPinto357/finance-bot
- Issues: https://github.com/DiegoPinto357/finance-bot/issues

```mermaid
graph TD
  A[User] -->|CLI Commands| B[finance-bot CLI]
  A -->|HTTP Requests| C[finance-bot Server]
  B --> D[Modules: Crypto, Stock, Fixed, Portfolio, ProcessScript]
  C --> D
  D --> E[Data Providers: Binance, CoinMarketCap, MercadoBitcoin, Google Sheets, etc.]
  D --> F[Database (MongoDB)]
  D --> G[Cache Layer]
  C --> H[Backup Scheduler]
```

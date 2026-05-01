# Live Add Collateral QA Checklist

Round 5E verifies the live Add Collateral boundary. Do not force a live transaction if no action-needed manager exists.

## Part A: Live Flag Off

1. Start the app without the live flag:

   ```powershell
   pnpm -C apps/web dev --host 127.0.0.1
   ```

2. Open the Vite URL, connect Sui Wallet, and import the manager manually.
3. Confirm the Dashboard reads the manager and shows the correct actionability.
4. If Transaction Review is available, confirm:
   - no wallet prompt opens;
   - live signing is disabled;
   - review remains preview-only or blocked;
   - the manager ID is shortened only.

## Part B: Live Flag On With Current Healthy Manager

1. Start the app with the live flag explicitly enabled:

   ```powershell
   $env:VITE_ENABLE_LIVE_ADD_COLLATERAL="true"; pnpm -C apps/web dev --host 127.0.0.1
   ```

2. Connect Sui Wallet and open the current healthy Mainnet SUI/USDC manager.
3. Confirm:
   - read source is DeepBook state;
   - actionability is No rescue needed;
   - PTB preview/signing remains disabled;
   - Rescue Simulator shows healthy/no-rescue-needed or real baseline display, not urgent live Add Collateral;
   - Demo Mode can use the real baseline for simulated shock but still cannot open a wallet prompt;
   - no wallet prompt opens;
   - copy says no rescue is needed while RR is above target.

## Part C: Optional Live Execution With A Safe Action-Needed Manager

Attempt live execution only if all conditions are true:

- you control the manager;
- the amount is small and acceptable to lose;
- Mainnet is intentionally selected;
- manager ID, connected wallet, amount, and asset all match the review;
- `VITE_ENABLE_LIVE_ADD_COLLATERAL=true` is explicitly enabled;
- the review shows action-needed DeepBook state, not mock/demo state.

Stop immediately if:

- wallet details differ from the review;
- manager ID is unexpected;
- amount is unexpected;
- wallet shows a method or asset that does not match Add Collateral USDC;
- review indicates no-rescue-needed or zero-debt;
- the wallet prompt opens before acknowledgement and explicit submit click.

Expected behavior:

- Transaction Review appears before the wallet prompt.
- Acknowledgement is required.
- Wallet opens only after clicking `Sign and Submit with Wallet`.
- If rejected, Result says wallet rejected and no transaction was submitted.
- If submitted, Result shows a real digest and Sui Explorer link.
- After confirmation, manager refresh is attempted.
- If refresh fails, Result says the transaction may be confirmed but latest manager state could not be read.

If no action-needed manager is available, do not force live execution. Use Demo Mode fallback for video.

## Part D: Real Baseline Propagation QA

1. Import the Mainnet SUI/USDC manager.
2. Confirm Dashboard shows real DeepBook read or an honest partial/read-error state.
3. Open Rescue Simulator and confirm the source badge is `Real DeepBook baseline`, `Partial DeepBook baseline`, or clearly simulated fallback.
4. Open Demo Mode and switch between `Simulated Demo Mode` and `Real Manager Baseline + Simulated Shock`.
5. Confirm shocked price, stressed RR, Add Collateral recommendation, expected after RR, and interest drift are labeled as simulated or estimates.
6. Confirm no wallet prompt opens from Demo Mode.
7. Confirm Real Manager Baseline + Simulated Shock is not presented as a live action-needed onchain state.

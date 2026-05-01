# Demo Script

This is the canonical MarginGuard demo script. Keep only this file as the source of truth for the hackathon narration.

Goal: explain in 2-3 minutes that MarginGuard is a browser-only safety layer for DeepBook Margin, not another leverage terminal and not a keeper.

## Three-Minute Flow

| Time | Action | Screen | Message |
|---:|---|---|---|
| 0:00-0:20 | Open landing page | `/` | MarginGuard is a pre-liquidation risk console for DeepBook Margin. |
| 0:20-0:40 | Launch app and connect wallet | `/dashboard` | Browser-only, non-custodial, user-approved writes. |
| 0:40-1:00 | Import/open manager | Dashboard | User imports the manager manually; no indexer or scanner. |
| 1:00-1:20 | Show real Risk Snapshot | Dashboard | If the current manager is healthy, show no-rescue-needed blocking. |
| 1:20-1:45 | Switch to Demo Mode | `/demo` | Simulated Demo or Real DeepBook baseline + simulated SUI price shock creates an action-needed story. |
| 1:45-2:05 | Show rescue options | Demo / Rescue | Add Collateral is P0; reduce-only and Smart TPSL are P1/demo-only. |
| 2:05-2:30 | Open Transaction Review | Modal | Review amount, manager short ID, wallet, network, warnings, and acknowledgement. |
| 2:30-2:45 | Show simulated result | Result | Use demo result unless a real digest exists. Do not claim live success without digest. |
| 2:45-3:00 | Close with limitations | Any | No backend, no indexer, no keeper; live Add Collateral is safety-gated. |

## Click Path

1. Open `/`.
2. Click `Launch Risk Console`.
3. Connect Sui wallet.
4. Import or select a SUI/USDC Margin Manager.
5. Show current Risk Snapshot.
6. If the current real manager is healthy, point out `No rescue needed while RR is above target.`
7. Go to `/demo`.
8. Choose `Real Manager Baseline + Simulated Shock` if a real baseline is loaded, otherwise use `Simulated Demo Mode`.
9. Run the simulated price shock.
10. Show Warning/action-needed state with real, simulated, and estimate labels.
11. Click `Open Rescue Simulator` or review the recommendation in Demo Mode.
12. Click `Review Add Collateral PTB Preview`.
13. Show Transaction Review warnings and acknowledgement.
14. Use the simulated result path for video unless a real digest exists.
15. Return to Dashboard.

## English Judge Narrative

DeepBook Margin brings leverage to Sui, but leverage creates a risk-management gap. Users need to understand risk ratio, liquidation threshold, debt exposure, and rescue options before liquidation pressure becomes urgent.

MarginGuard is a browser-only safety layer around DeepBook Margin. The user connects a Sui wallet, manually imports a Margin Manager, and the app reads the manager through Sui and DeepBook adapters. There is no backend, no indexer, no keeper, and no custody.

On the real dashboard, the current manager can be read directly. If it is healthy, MarginGuard blocks Add Collateral signing because no rescue is needed. For the demo story, we switch to Demo Mode. If a real Mainnet SUI/USDC manager baseline is loaded, Demo Mode can seed starting RR, asset value, debt value, threshold, target ratio, and borrow APR from it. The SUI price shock and stressed RR remain simulated and labeled.

MarginGuard compares three rescue paths. Add Collateral is the P0 path. Reduce-only and Smart TPSL are P1/demo-only in this submission. We choose Add Collateral and open Transaction Review before any wallet prompt. The review shows the manager short ID, connected wallet, Mainnet, SUI/USDC market, USDC amount, before and expected after risk ratios, warnings, and acknowledgement.

Add Collateral PTB is implemented and safety-gated. Live signing is disabled by default. Wallet-signed execution is available only under live QA conditions. No live Add Collateral success should be claimed unless a real transaction digest is provided. For the video, if no safe action-needed manager is available, we use the simulated result and label it clearly.

MarginGuard v0 is an active risk console and gated rescue PTB builder. It does not guarantee liquidation prevention and it does not act while the user is away.

## Chinese Judge Narrative

DeepBook Margin 为 Sui 带来了链上杠杆基础设施，但杠杆也带来了风险管理问题。用户需要在清算压力出现之前理解 risk ratio、清算阈值、债务敞口和可执行的救援方案。

MarginGuard 是 DeepBook Margin 之上的浏览器端安全层。用户连接 Sui 钱包，手动导入 Margin Manager，应用通过 Sui 和 DeepBook adapter 读取当前状态。MarginGuard 没有后端，没有 indexer，没有 keeper，也不托管用户资金。

在真实 Dashboard 中，应用可以读取当前 manager。如果这个 manager 是健康状态，MarginGuard 会阻止 Add Collateral 签名，因为当前不需要救援。为了展示完整故事，我们切换到 Demo Mode，模拟 SUI 价格下跌，让仓位进入 Warning 状态。

MarginGuard 比较三种救援路径。Add Collateral 是 P0 路径。Reduce-only 和 Smart TPSL 在本次提交中是 P1 / demo-only。我们选择 Add Collateral，在任何钱包弹窗之前先打开 Transaction Review。Review 中会显示 manager 短 ID、连接的钱包、Mainnet、SUI/USDC 市场、USDC 数量、执行前和预期执行后的 risk ratio、风险提示和确认勾选。

Add Collateral PTB 已实现并带有安全门控。Live signing 默认关闭。除非提供真实交易 digest，否则不应该宣称 Add Collateral 已经在链上成功执行。如果没有安全的 action-needed manager，视频中使用明确标注的模拟结果。

MarginGuard v0 是 active risk console + rescue PTB builder。它不保证避免清算，也不会在用户离开应用后自动执行。

## Fallback Words

If manager read fails:

> The real path reads a manually imported manager through Sui and DeepBook. For the video, I am switching to Demo Mode so the same risk and rescue workflow remains visible with simulated values.

If the real manager is healthy:

> This manager is healthy, so MarginGuard correctly blocks Add Collateral signing. I will use Demo Mode to show the action-needed flow without forcing a real transaction.

If wallet execution is unavailable:

> The live Add Collateral path is safety-gated and disabled by default. Since no safe action-needed manager is available, this result is simulated and no transaction was submitted.

If a wallet transaction fails or is rejected during controlled manual QA:

> The wallet rejected or failed the transaction. MarginGuard does not claim submission or risk improvement without a returned digest and manager refresh.

## What Must Be Visible

- No backend / no indexer / no keeper.
- Manual manager import.
- Connected wallet and selected network.
- DeepBook state when available.
- Real baseline, simulated shock, and estimate labels in Demo Mode.
- Add Collateral as P0.
- Reduce-only and Smart TPSL as P1/demo-only.
- Transaction Review before wallet prompt.
- Acknowledgement before signing.
- No live success claim without real digest.

## Demo QA Checklist

- [ ] Landing page loads.
- [ ] Dashboard route loads.
- [ ] Wallet connection UI is visible.
- [ ] Manager import is manual.
- [ ] Current healthy manager remains no-rescue-needed and signing blocked.
- [ ] Demo Mode works without manager or wallet.
- [ ] Demo values are labeled simulated.
- [ ] Add Collateral review opens.
- [ ] No wallet prompt opens from demo-only state.
- [ ] Result modal does not show fake explorer links.
- [ ] Full manager IDs are redacted in screenshots and video.
- [ ] Pitch fits within three minutes.

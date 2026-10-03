# 4.6 实战源码适配审查

审查日期：2026-10-04。结论依据为固定提交的源码与作者文档；下载源码只作静态阅读，未执行其程序或测试。当前公开候选均不能证明全部 108 个本项目角色条目已具备完整技能、行迹和星魂实战机制。

## 可执行候选与固定版本

| 来源 | 固定提交 | 许可与实战形态 | 当前可用范围 |
|---|---|---|---|
| [pzc2004/HSR_Nous](https://github.com/pzc2004/HSR_Nous/tree/2344d045dab5054a4ca193f2715c263f963d3d37) | `2344d045dab5054a4ca193f2715c263f963d3d37` | MIT；Python DSL 编译、事件总线、行动调度、结算流水线、YAML 钩子 | 老角色文件覆盖较广，具体效果仍有明确待实现项；真珠、知更鸟·晴歌、砂金·戏浪缺角色模板 |
| [tingyumian662/hsr-simulator](https://github.com/tingyumian662/hsr-simulator/tree/7a8b7e512d272b7f48c29826c0004d4afd62aa9d) | `7a8b7e512d272b7f48c29826c0004d4afd62aa9d`；data/VERSION=`v8.3.0` | Python AV/额外回合事件引擎；LICENSE 为 MIT 正文加中文“不用于商业用途”，GitHub API 为 NOASSERTION，不能标作无附加条件的 MIT | 包含真珠、晴歌、戏浪等新角色实际模块；旧角色有大量明确空壳 |
| [fribbels/hsr-optimizer](https://github.com/fribbels/hsr-optimizer/tree/76cff12930b6fe541c5bde871a46a104e8d23c51) | `76cff12930b6fe541c5bde871a46a104e8d23c51` | MIT；TypeScript 条件面板和手动组合伤害计算 | 适合面板与单次伤害交叉验证；不能替代 SP、能量、回合、受击与召唤物事件状态机 |

tingyu README 写“40 完整 + 52 空壳、42 模块”，已与固定提交目录不一致。静态逐 JSON 检查得到 93 份角色数据，其中 48 份 `_pending` 非空、45 份无该标记，计数使用 SymPy 核验。**45 仅表示数据字段未标 pending，并非独立确认全部效果正确。** `engine/characters/__init__.py` 还注册了 boothill/huohuo/rappa，但这三份 JSON 仍为 `skills={}`, `traces=[]`, `eidolons=[]`，因此注册模块数也不能当完整角色数。逐文件记录见 `source-adapters/tingyu-kit-audit.json`。

许可原文见 [tingyu LICENSE](https://github.com/tingyumian662/hsr-simulator/blob/7a8b7e512d272b7f48c29826c0004d4afd62aa9d/LICENSE)。本地学习用途符合其用途说明；分发保留完整版权及许可文件。商业再利用需先厘清中文附加说明与 MIT 正文的冲突。

## 真珠：可执行效果证据

[zhenzhu.py](https://github.com/tingyumian662/hsr-simulator/blob/7a8b7e512d272b7f48c29826c0004d4afd62aa9d/模拟器本体/engine/characters/zhenzhu.py) 实际调用引擎伤害、能量和欢愉系统，导出 PHASE_HOOKS、OBSERVER_HOOKS、INIT、TECHNIQUE、AI；`engine/characters/__init__.py` 将其加入 PILOTS 并按在场角色注入钩子。

| 效果 | 具体源码 |
|---|---|
| 好活持有上限与抵御值、半血减伤 | `_zz_gain`, `_zz_sync_pool`, `_zz_absorb_check` |
| E1 两次致命保命、按欢愉人数增益 | `_zz_e1_fatal_check`, `_zz_init` |
| 深度学习底本、强化普攻形态、额外回合临时资源与回收 | `_zz_start_dl`, `_zz_key_rewrite`, `_zz_extra_turn_start/end` |
| 欢愉技后队友攻击追加伤害、E4 倍率 | `_zz_elation_arm`, `_zz_on_attack` |
| 行迹终结技能量反馈、队友回合好活、效果抵抗 | `_zz_after_ult`, `_zz_ally_turn_start`, `_zz_sync_pool` |
| 防御转欢愉与治疗加成 | `_zz_eff_stats` |
| E6 深度学习抗性穿透和底本追伤 | `_zz_sync_e6`, `_zz_base_rider` |
| E3/E5 技能等级 | JSON 星魂 hook 与通用效果解析；对应测试检查等级 boost |

[test_v7260_zhenzhu.py](https://github.com/tingyumian662/hsr-simulator/blob/7a8b7e512d272b7f48c29826c0004d4afd62aa9d/模拟器本体/tests/test_v7260_zhenzhu.py) 有持有上限、抵御、充能耗尽、额外回合资源回收、欢愉人数/E4、能量只触发一次、行迹阈值、E1 次数、E2/E3/E5/E6 的具体断言。这里确认“测试源码存在且覆盖这些行为”，未宣称测试在本项目已运行通过。真珠 JSON 自述 2026-09-29 4.6 原始技能文本；精确到实机的效果正确性仍需用户数据口径与独立用例复核。

## Nous 缺口与覆盖差异

Nous 下载的 `tests/fixtures/templates/characters` 有普通角色、测试角色及少量 legacy 模板。对照本项目条目，精确 ID 缺失包括十个强化 ID（11004/11005/11006/11102/11205/11212/11217/11306/11307/11310）及 1503/1512/1513。部分强化 kit 已替换到基础 ID 中；需要逐技能版本映射，不能把缺失的强化 ID 自动视为无机制，也不能直接把同名基础 kit 当原版和强化版同时实现。

明确效果缺口示例均在对应 YAML notes 可读：

- `1001_三月七.yaml`：冻结概率未实现（当前强制冻结）；冻结目标能量反馈及 E4 反击附加伤害仍有缺口。
- `1002_丹恒.yaml`：受攻击概率提速、对减速目标普攻增伤待实现。
- `1003_姬子.yaml`：行迹概率灼烧有待实现说明。
- `1303_ruan_mei.yaml`：击破转增伤的离散台阶按连续值近似。
- `1308_黄泉.yaml`：E1 对负面敌人暴击率、E6 普攻/战技视为终结技及无视弱点仍有待实现说明。
- `1310_流萤.yaml`：强化弱点削韧、E1 范围与减伤等细节有待补说明。
- `1510_姬子•启行.yaml`：队友协助/额外回合及部分星魂次数限制待补。

具体清单以 `source-adapters/nous-fixture-audit.json` 和模板正文为准，不能由文件存在推导全部星魂完成。Nous adapter README 也明确将缺乏表达能力的效果写入 notes，经 compile/smoke/golden-diff 门控。

tingyu 48 份空壳包括丹恒、三月七·存护、姬子原版、黑天鹅、卡芙卡、景元、镜流、托帕、砂金原版、玲可、佩拉、银枝等，完整 ID 列表在 `tingyu-kit-audit.json`。Nous 能为其中多名提供技能与事件钩子，但上面几例已说明这些 kit 仍有逐效果缺口。兩者并集可扩大可接入范围，不能形成“全部 108 全效果”的现成实现。

## 推荐适配路径

当前项目以固定循环比较配装/星魂为目标。推荐保留现有前端，把**一个** Python 事件引擎作为计算后端：优先评估 tingyu 的较新版本 kit（特别是真珠/晴歌/戏浪），在符合其用途说明的前提下保留许可。入口为 `engine/core/combat_engine.py::simulate`，已有 `web/api.py::run_simulation` 将前端队伍/遗器/光锥映射成 configs；依赖 `requirements.txt`：FastAPI 0.115.6、uvicorn、Pydantic>=2.11、Jinja2 3.1。角色模块与核心状态强耦合，JSON 单独复制不能执行。

其 `SimRequest` 只有 team/enemy/enemies/max_av，目前行动选择走角色 AI；要匹配本项目固定循环，必须增加策略适配，将循环 action/target/ultimate timing 输入接到 AI 选择点，保留合法性判定及事件状态，再将 damage/SP/energy/AV/buff 日志转成当前前端输出。Nous 提供独立 `policy_api.py` 与 scheduler，可作为该策略层设计参考。

若需要没有附加用途说明的可复用基础，Nous MIT 事件引擎更清晰；新角色逐效果转译 tingyu 只能在其许可允许范围内进行。跨来源 kit 需转成选定引擎的事件语义，不能把两个 engine 状态对象拼接。逐角色效果登记至少含 trigger/target/magnitude/duration/stack_limit/cooldown/version 与独立断言；状态分为 verified/partial/missing，前端遇到 partial 必须显示具体缺口。

Fribbels 的 `src/lib/conditionals/character/1500/Pearl.ts` 可交叉核对 E1/E2/E4/E6 条件与属性转换。作者 advanced-rotations 文档明确 DoT/Break 未按动作时间线处理，按主条件与触发次数计算；适用于伤害拉表参考。

## 另外两站

[cowaii Calculator](https://cowaii.io/HonkaiSR/Calculator/) 页面正文有动态循环、目标与战斗配置。已下载其公开数据和公式脚本作静态核对，未找到授予复用代码的许可或作者 GitHub 引擎仓库；公开脚本访问本身不代表可复制分发。当前 `dCharacters.js` 的数据覆盖和显示页不能当全部 4.6 事件机制证明。

[starrailsim.com](https://starrailsim.com/start) 是可用在线模拟器，前端调用云端接口。未找到公开引擎仓库/代码许可，也没有证据将其与 pzc2004/HSR_Nous 视为同一项目，因此不能把公共 Nous MIT 套用到该网站。Cloud API 也没有核实可供本项目前端调用的公开接口合同。

[Darkglade1/Star-Rail-Battle-Simulator](https://github.com/Darkglade1/Star-Rail-Battle-Simulator/tree/0aba14ab96fe268d5d65ec51fab24c231bb93a96) 固定提交 `0aba14ab96fe268d5d65ec51fab24c231bb93a96`，MIT，Java 战斗事件实现，但角色库较旧，不适合作为 4.6 全角色首选。

全部下载材料位于本报告相邻的 `source-adapters/`；本轮没有修改 web 运行代码。

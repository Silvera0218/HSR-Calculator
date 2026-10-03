# 图表选型

本次在现有前端增加结果图，采用图表模式。图表区统一 Mono；使用技能原版 mono-tokens.js。所有数据来自当前方案计算与固定循环日志，不使用演示数据。

已审计 catalog.md 的 L1–L20 与 F1–F17。L1/L4–L13/L16–L20 的时间生命史、矩阵、网络、归属、漏斗与分布数据契约不符合当前三个问题；L3 针对长日历事件序列，当前是非等距 AV；L14 为百分比构成，可用于份额但会抹掉绝对伤害；L15 多选比例契约不适配；未进入 Glance。

队员贡献比较：比较 L2 Dot Cascade、F1 Rung Bars、F5 Tick Rows。L2 的单位点阵与短竖排名称不适合角色中文形态长名称；F1 可用但横轴长标签拥挤；锁定 F5/C1，卡标题 Six teams, shipped and counted，模板 templates/basics-gallery.html。保留逐单位刻线、每五刻标点、完整行底线、行末数值、确定性高度纹理与 0.08/0.012 秒 stagger。数据单位随最大伤害自动设为十进制单位，末刻高度编码余数。

累计伤害比较：比较 L3 Barcode Lollipop、F2 Hairline Line、F3 Hairline Area。L3 把时间当固定日历单位，AV 事件间隔不均；F3 强调面积而目前需要逐行动查询；锁定 F2/B2，卡标题 Thirty days of sign-ups，模板 templates/basics-gallery.html。保留事件条码地板、发丝路径、两类实空点、间隔峰值标注与 1.2 秒 draw。横轴按实际 AV，空心语义替换为敌方回合。超出 30 条时取最多 30 条真实日志点，旁注说明采样，完整数据保留在日志表。

击破前后比较：比较 L7 Brand Spectrum、F6 Paired Rungs、F12 Dumbbell Queue。L7 双极量表的契约与伤害量纲不符；F6 能表示两个值但将弱化同条件差值；锁定 F12/C8，卡标题 Onboarding, before and after the redesign，模板 templates/basics-gallery.html。保留空实端点、水平完整导轨、差值单位串珠、行标与前后数值、0.08 秒行 stagger 和 0.03 秒珠 stagger。轴从零开始，标签上下分开防重叠。每颗珠是标明的伤害差值单位。

模板骨架采用标题、副标题、SVG、来源行四件套；源代码出处明确标在 charts.mjs。MONO.obsReveal 统一负责滚入重播及点击重播，添加键盘重播与 reduced-motion 降级。字体使用本地 Inter 资源，中文回退微软雅黑。

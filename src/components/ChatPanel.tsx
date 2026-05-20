import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';

const QA_PAIRS = [
  { q: '今天情绪怎么样？',
    a: "根据最近记忆，今天情绪总体积极。上午在编程课上表现得非常投入，情绪强度0.88。傍晚和机器人助手互动时也很快乐。最近30天的情绪主色调是快乐（占比45%）和好奇（占比30%）。",
    refs: ['mem_007', 'mem_015'] },
  { q: '最近对什么感兴趣？',
    a: "最近对编程的兴趣持续上升。从手掰编程到图形编程工具图形化编程的转变趋势明显，且有3次独立完成编程项目的记录。独立完成任务带来的满足感最高，情绪强度平均0.92。",
    refs: ['mem_012', 'mem_020', 'insight_001'] },
  { q: '和哪些人互动最多？',
    a: "你的社交圈以爸爸妈妈为核心，外部社交有2-3名稳定朋友（小红、小华）。和爸爸的互动主要集中在拼装/搭建类游戏（占父子互动的65%），和妈妈的互动更多在学习和日常陪伴上。",
    refs: ['mem_003', 'mem_025', 'insight_004'] },
  { q: '有什么需要关注的问题？',
    a: '在面对困难时虽然倾向于坚持，但当遇到特别难的题目时（如分数除法）仍会感到挫折。数学从具象到抽象的过渡还有差距，建议继续鼓励并以游戏化方式辅助数学练习。',
    refs: ['mem_031', 'insight_008'] },
  { q: '近一个月有哪些重要时刻？',
    a: '近一个月的高光时刻包括：独立完成编程机器人画正方形程序（里程碑）、第一次骑两轮自行车成功、以及六一儿童节游乐园之行。这些记忆的情绪强度都在0.88以上。',
    refs: ['mem_020', 'mem_035', 'mem_007'] },
];

export default function ChatPanel() {
  const { chatOpen, toggleChat, selectMemory, rawMemories, insightMemories, detailOpen, theme } = useAppState();
  const isDark = theme === 'dark';
  const [activeQA, setActiveQA] = useState<number | null>(null);

  // Listen for demo event to programmatically expand a QA pair
  useEffect(() => {
    const handler = (e: Event) => {
      const index = (e as CustomEvent).detail?.index;
      if (typeof index === 'number') setActiveQA(index);
    };
    window.addEventListener('demo-chat-expand-internal', handler);
    return () => window.removeEventListener('demo-chat-expand-internal', handler);
  }, []);

  return (
    <>
      <button
        id="chat-trigger"
        onClick={toggleChat}
        className={`fixed bottom-6 w-12 h-12 bg-[#00f2ff]/15 border border-[#00f2ff]/20 rounded-full flex items-center justify-center text-xl hover:bg-[#00f2ff]/25 transition-all z-20 shadow-[0_0_15px_rgba(0,242,255,0.1)] ${
          detailOpen ? 'right-[436px]' : 'right-6'
        }`}
      >
        💬
      </button>

      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed bottom-20 w-[360px] max-h-[500px] backdrop-blur-xl border rounded-xl p-4 z-20 shadow-2xl overflow-hidden flex flex-col ${
              isDark ? 'bg-[#0d0d1a]/98 border-[#ffffff08]' : 'bg-white/98 border-gray-200'
            } ${
              detailOpen ? 'right-[436px]' : 'right-6'
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className={`font-medium text-sm ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>💬 问问 GraphMe</h3>
              <button onClick={toggleChat} className={`text-lg leading-none ${isDark ? 'text-gray-600 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}>✕</button>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1">
              {QA_PAIRS.map((qa, i) => (
                <div key={i}>
                  <button
                    onClick={() => setActiveQA(activeQA === i ? null : i)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                      activeQA === i
                        ? isDark ? 'bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/20' : 'bg-[#0088cc]/10 text-[#0088cc] border border-[#0088cc]/20'
                        : isDark ? 'bg-[#1a1a2e]/50 text-gray-400 hover:bg-[#1a1a2e] hover:text-gray-300 border border-transparent' : 'bg-gray-100/50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-transparent'
                    }`}
                  >
                    {qa.q}
                  </button>
                  <AnimatePresence>
                    {activeQA === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className={`px-3 py-2 mt-1 border-l-2 rounded-r text-xs leading-relaxed ${
                          isDark ? 'bg-[#0a0a0f]/80 border-[#00f2ff]/30 text-gray-400' : 'bg-gray-50 border-[#0088cc]/30 text-gray-600'
                        }`}>
                          {qa.a}
                        </div>
                        {qa.refs && qa.refs.length > 0 && (
                          <div className="px-3 py-1.5 flex gap-2 flex-wrap">
                            {qa.refs.map(ref => (
                              <button
                                id={i === 0 && ref === qa.refs[0] ? 'chat-link-0' : undefined}
                                key={ref}
                                onClick={() => {
                                  const isInsight = ref.startsWith('insight_');
                                  const memory = isInsight
                                    ? insightMemories.find(m => m.id === ref)
                                    : rawMemories.find(m => m.id === ref);
                                  if (memory) selectMemory(memory);
                                }}
                                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                                  ref.startsWith('insight_')
                                    ? 'bg-[#ffb800]/10 text-[#ffb800]/80 hover:bg-[#ffb800]/20 border border-[#ffb800]/20'
                                    : 'bg-[#00f2ff]/10 text-[#00f2ff]/80 hover:bg-[#00f2ff]/20 border border-[#00f2ff]/20'
                                }`}
                              >
                                🔗 {ref}
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <div className={`mt-3 pt-3 border-t ${isDark ? 'border-[#ffffff08]' : 'border-gray-200'}`}>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="输入你的问题..."
                  className={`flex-1 border rounded-lg px-3 py-1.5 text-xs focus:outline-none ${
                    isDark ? 'bg-[#1a1a2e]/50 border-[#ffffff08] text-gray-300 placeholder-gray-600 focus:border-[#00f2ff]/30' : 'bg-gray-100 border-gray-200 text-gray-700 placeholder-gray-400 focus:border-[#0088cc]/30'
                  }`}
                />
                <button className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  isDark ? 'bg-[#00f2ff]/10 text-[#00f2ff] hover:bg-[#00f2ff]/20' : 'bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc]/20'
                }`}>
                  发送
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
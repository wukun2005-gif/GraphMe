import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';

const QA_PAIRS = [
  { q: '小哥今天情绪怎么样？', a: "根据最近记忆，小哥今天情绪总体积极。上午在编程课上表现得非常投入，情绪强度0.88。傍晚和Loona互动时也很快乐。最近30天的情绪主色调是快乐（占比45%）和好奇（占比30%）。" },
  { q: '小哥最近对什么感兴趣？', a: "最近小哥对编程的兴趣持续上升。从手掰编程到Scratch图形化编程的转变趋势明显，且有3次独立完成编程项目的记录。独立完成任务带来的满足感最高，情绪强度平均0.92。" },
  { q: '小哥和哪些人互动最多？', a: "小哥的社交圈以爸爸妈妈为核心，外部社交有2-3名稳定朋友（小红、小华）。和爸爸的互动主要集中在拼装/搭建类游戏（占父子互动的65%），和妈妈的互动更多在学习和日常陪伴上。" },
  { q: '小哥有什么需要关注的问题？', a: '小哥在面对困难时虽然倾向于坚持，但当遇到特别难的题目时（如分数除法）仍会感到挫折。数学从具象到抽象的过渡还有差距，建议继续鼓励并以游戏化方式辅助数学练习。' },
  { q: '小哥近一个月有哪些重要时刻？', a: '近一个月的高光时刻包括：独立完成ClicBot画正方形程序（里程碑）、第一次骑两轮自行车成功、以及六一儿童节游乐园之行。这些记忆的情绪强度都在0.88以上。' },
];

export default function ChatPanel() {
  const { chatOpen, toggleChat } = useAppState();
  const [activeQA, setActiveQA] = useState<number | null>(null);

  return (
    <>
      <button
        onClick={toggleChat}
        className="fixed right-6 bottom-6 w-12 h-12 bg-[#00f2ff]/15 border border-[#00f2ff]/20 rounded-full flex items-center justify-center text-xl hover:bg-[#00f2ff]/25 transition-all z-20 shadow-[0_0_15px_rgba(0,242,255,0.1)]"
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
            className="fixed right-6 bottom-20 w-[360px] max-h-[500px] bg-[#0d0d1a]/98 backdrop-blur-xl border border-[#ffffff08] rounded-xl p-4 z-20 shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-gray-300 font-medium text-sm">💬 问问小哥</h3>
              <button onClick={toggleChat} className="text-gray-600 hover:text-gray-300 text-lg leading-none">✕</button>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1">
              {QA_PAIRS.map((qa, i) => (
                <div key={i}>
                  <button
                    onClick={() => setActiveQA(activeQA === i ? null : i)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                      activeQA === i
                        ? 'bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/20'
                        : 'bg-[#1a1a2e]/50 text-gray-400 hover:bg-[#1a1a2e] hover:text-gray-300 border border-transparent'
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
                        <div className="px-3 py-2 mt-1 bg-[#0a0a0f]/80 border-l-2 border-[#00f2ff]/30 rounded-r text-xs text-gray-400 leading-relaxed">
                          {qa.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-[#ffffff08]">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="输入你的问题..."
                  className="flex-1 bg-[#1a1a2e]/50 border border-[#ffffff08] rounded-lg px-3 py-1.5 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-[#00f2ff]/30"
                />
                <button className="px-3 py-1.5 bg-[#00f2ff]/10 text-[#00f2ff] text-xs rounded-lg hover:bg-[#00f2ff]/20 transition-colors">
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
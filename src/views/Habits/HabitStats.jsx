import { Target, TrendingUp } from "lucide-react";

export default function HabitStats({ todayCompletionPercentage, getMotivationalMessage }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
       <div className="card bg-orange-400/5 border-orange-400/20 p-6 flex flex-col justify-between border">
          <div>
             <div className="label-caps !mb-4 flex items-center gap-2 text-orange-400">
                <Target size={14} />
                Fokus heute
             </div>
             <p className="text-sm font-medium leading-relaxed opacity-70 text-slate-100">
                {getMotivationalMessage(todayCompletionPercentage)}
             </p>
          </div>
          <div className="mt-6 h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/10">
             <div className="h-full bg-orange-400 transition-all duration-1000" style={{ width: `${todayCompletionPercentage}%` }} />
          </div>
       </div>

       <div className="card p-6 border-dashed border-white/10/50 bg-slate-900 border">
          <div className="label-caps !mb-4 flex items-center gap-2 text-slate-400">
             <TrendingUp size={14} className="text-slate-400" />
             Psychologie
          </div>
          <p className="text-[11px] font-medium opacity-50 leading-relaxed italic text-slate-400">
             "Motivation bringt dich in Gang. Gewohnheit hält dich am Laufen." – Jim Ryun. 
             Konzentriere dich darauf, die Kette nicht zu unterbrechen.
          </p>
       </div>
    </div>
  );
}

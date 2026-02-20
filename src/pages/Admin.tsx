import React, { useEffect, useState } from 'react';
import { db } from '../api/firebase';
import { collection, query, getDocs, updateDoc, doc } from 'firebase/firestore';
import type { UserProfile, PlanLevel } from '../types';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);

  const fetchUsers = async () => {
    const q = query(collection(db, "users"));
    const querySnapshot = await getDocs(q);
    const userList = querySnapshot.docs.map(d => ({ ...d.data() } as UserProfile));
    setUsers(userList);
  };

  const updatePlan = async (userId: string, newPlan: PlanLevel) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { plan: newPlan });
      fetchUsers(); 
    } catch (err) {
      alert("Erro ao atualizar plano");
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-6 border-b border-slate-100 bg-white">
          <h2 className="text-2xl font-bold text-slate-800">Gestão de Usuários Liberdade IA</h2>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-semibold">
            <tr>
              <th className="py-4 px-6">Usuário</th>
              <th className="py-4 px-6">Plano</th>
              <th className="py-4 px-6">Alterar Para</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.uid} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-6">
                  <p className="font-bold text-slate-700">{u.displayName}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </td>
                <td className="py-4 px-6">
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                    {u.plan}
                  </span>
                </td>
                <td className="py-4 px-6 flex gap-2">
                  {(['basic', 'premium', 'plus', 'ultimate'] as PlanLevel[]).map(p => (
                    <button 
                      key={p}
                      onClick={() => updatePlan(u.uid, p)}
                      className={`text-[10px] px-2 py-1 rounded font-bold transition-all ${u.plan === p ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      {p.toUpperCase()}
                    </button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
import React, { useEffect, useState } from 'react';
import { db } from '../api/firebase';
import { collection, query, getDocs, updateDoc, doc } from 'firebase/firestore';
import { UserProfile, PlanLevel } from '../types';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);

  const fetchUsers = async () => {
    const q = query(collection(db, "users"));
    const querySnapshot = await getDocs(q);
    const userList = querySnapshot.docs.map(doc => doc.data() as UserProfile);
    setUsers(userList);
  };

  const updatePlan = async (userId: string, newPlan: PlanLevel) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { plan: newPlan });
    fetchUsers(); 
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div className="p-8 bg-white rounded-3xl shadow-xl border border-slate-100">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Gestão de Usuários Akumol</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100 text-slate-400 text-sm uppercase">
            <th className="py-4 px-2">Usuário</th>
            <th className="py-4 px-2">Plano Atual</th>
            <th className="py-4 px-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.uid} className="border-b border-slate-50 hover:bg-slate-50/50">
              <td className="py-4 px-2 font-medium">{u.displayName}</td>
              <td className="py-4 px-2">
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                  {u.plan}
                </span>
              </td>
              <td className="py-4 px-2 flex gap-2">
                {(['basic', 'premium', 'ultimate'] as PlanLevel[]).map(p => (
                  <button 
                    key={p}
                    onClick={() => updatePlan(u.uid, p)}
                    className="text-[10px] bg-slate-200 hover:bg-indigo-600 hover:text-white px-2 py-1 rounded transition-colors"
                  >
                    Mudar para {p}
                  </button>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
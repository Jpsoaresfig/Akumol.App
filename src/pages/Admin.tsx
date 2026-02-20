import React, { useEffect, useState, useCallback } from 'react';
import { db } from '../api/firebase';
import { collection, query, getDocs, updateDoc, doc } from 'firebase/firestore';
import type { UserProfile, PlanLevel } from '../types';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);

  // Usamos useCallback para que a função seja estável e não mude a cada renderização
  const fetchUsers = useCallback(async () => {
    try {
      const q = query(collection(db, "users"));
      const querySnapshot = await getDocs(q);
      const userList = querySnapshot.docs.map(doc => ({ 
        ...doc.data(),
        uid: doc.id // Garante que o UID venha corretamente do ID do documento
      } as UserProfile));
      setUsers(userList);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  }, []);

  const updatePlan = async (userId: string, newPlan: PlanLevel) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { plan: newPlan });
      // Atualiza a lista local após a mudança com sucesso
      await fetchUsers(); 
    } catch (error) {
      alert("Falha ao atualizar plano."+ error);
    }
  };

  // O efeito agora chama a função estável de forma segura
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (isMounted) {
        await fetchUsers();
      }
    };

    loadData();

    // Função de limpeza para evitar atualizar estado em componente desmontado
    return () => { isMounted = false; };
  }, [fetchUsers]);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800">Gestão de Usuários</h2>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-xs uppercase">
            <tr>
              <th className="py-4 px-6">Usuário</th>
              <th className="py-4 px-6">Plano</th>
              <th className="py-4 px-6">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.uid} className="hover:bg-slate-50/50">
                <td className="py-4 px-6 font-medium text-slate-700">{u.displayName}</td>
                <td className="py-4 px-6">
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    {u.plan}
                  </span>
                </td>
                <td className="py-4 px-6 flex gap-2">
                  {(['basic', 'premium', 'plus', 'ultimate'] as PlanLevel[]).map(p => (
                    <button 
                      key={p}
                      onClick={() => updatePlan(u.uid, p)}
                      className={`text-[10px] px-2 py-1 rounded transition-all ${
                        u.plan === p 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-200 text-slate-600 hover:bg-indigo-500 hover:text-white'
                      }`}
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
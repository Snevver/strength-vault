import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

type WeightRow = { exercise_name: string; current_weight: number; last_updated: string };

const DevInfo = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [weights, setWeights] = useState<WeightRow[] | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            const { data } = await supabase.auth.getSession();
            setSession(data.session ?? null);
            setUserId(data.session?.user?.id ?? null);
        };
        load();
    }, []);

    const fetchWeights = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('exercise_weights')
                .select('exercise_name, current_weight, last_updated')
                .eq('user_id', userId);
            if (error) throw error;
            setWeights((data ?? []) as WeightRow[]);
        } catch (err) {
            console.error(err);
            setWeights([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Dev diagnostics</h2>
            <div className="mb-4">
                <div><strong>VITE_SUPABASE_URL:</strong> {import.meta.env.VITE_SUPABASE_URL ?? 'not set'}</div>
                <div><strong>VITE_SUPABASE_PUBLISHABLE_KEY:</strong> {import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'set' : 'not set'}</div>
            </div>

            <div className="mb-4">
                <div><strong>Session:</strong></div>
                <pre className="bg-muted p-2 rounded">{JSON.stringify(session, null, 2)}</pre>
            </div>

            <div className="mb-4">
                <div><strong>User ID:</strong> {userId ?? 'not signed in'}</div>
            </div>

            <div className="mb-4">
                <button className="btn btn-primary" onClick={fetchWeights} disabled={!userId || loading}>
                    {loading ? 'Loading...' : 'Fetch exercise_weights for user'}
                </button>
            </div>

            {weights && (
                <div>
                    <h3 className="font-semibold">Weights</h3>
                    {weights.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No rows found</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr>
                                    <th className="text-left">exercise_name</th>
                                    <th className="text-left">current_weight</th>
                                    <th className="text-left">last_updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {weights.map((w) => (
                                    <tr key={w.exercise_name}>
                                        <td>{w.exercise_name}</td>
                                        <td>{w.current_weight}</td>
                                        <td>{w.last_updated}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default DevInfo;

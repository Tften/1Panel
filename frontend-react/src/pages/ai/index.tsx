import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { searchOllamaModel, deleteOllamaModel, type OllamaModel } from '@/api/ai';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AIPage() {
    const { t } = useTranslation();
    const [models, setModels] = useState<OllamaModel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        searchOllamaModel({ page: 1, pageSize: 100 })
            .then((res) => setModels(res.data.items))
            .catch((error) => toast.error(String(error)))
            .finally(() => setLoading(false));
    }, []);

    const onDelete = async (id: number) => {
        if (!confirm(t('commons.confirmDelete', '确定删除？'))) return;
        try {
            await deleteOllamaModel([id], false);
            toast.success(t('commons.msg.deleteSuccess', '删除成功'));
            setModels((prev) => prev.filter((m) => m.id !== id));
        } catch {
            toast.error(t('commons.msg.deleteFailed', '删除失败'));
        }
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            <h1 className="text-2xl font-bold">{t('menu.aiTools', 'AI 工具')}</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Ollama {t('ai.model', '模型')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-64 w-full" />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('ai.name', '名称')}</TableHead>
                                    <TableHead>{t('ai.size', '大小')}</TableHead>
                                    <TableHead>{t('ai.status', '状态')}</TableHead>
                                    <TableHead>{t('commons.action', '操作')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {models.map((model) => (
                                    <TableRow key={model.id}>
                                        <TableCell className="font-medium">{model.name}</TableCell>
                                        <TableCell>{model.size}</TableCell>
                                        <TableCell>
                                            <Badge variant={model.status === 'Running' ? 'default' : 'secondary'}>
                                                {model.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button size="sm" variant="ghost" onClick={() => onDelete(model.id)}>
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

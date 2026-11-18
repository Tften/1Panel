import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { getFilesList, deleteFile, type FileInfo } from '@/api/file';
import { Folder, File, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function FileManagerPage() {
    const { t } = useTranslation();
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [path] = useState('/');

    useEffect(() => {
        getFilesList({ path, page: 1, pageSize: 100 })
            .then((res) => setFiles(res.data.items))
            .catch(() => undefined)
            .finally(() => setLoading(false));
    }, [path]);

    const onDelete = async (filePath: string) => {
        if (!confirm(t('commons.confirmDelete', '确定删除？'))) return;
        try {
            await deleteFile({ paths: [filePath] });
            toast.success(t('commons.msg.deleteSuccess', '删除成功'));
            setFiles((prev) => prev.filter((f) => f.path !== filePath));
        } catch {
            toast.error(t('commons.msg.deleteFailed', '删除失败'));
        }
    };

    const formatSize = (size: number) => {
        if (size === 0) return '-';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(size) / Math.log(k));
        return `${(size / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            <h1 className="text-2xl font-bold">{t('menu.files', '文件管理')}</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="font-mono text-sm">{path}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-64 w-full" />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('file.name', '名称')}</TableHead>
                                    <TableHead>{t('file.size', '大小')}</TableHead>
                                    <TableHead>{t('file.modTime', '修改时间')}</TableHead>
                                    <TableHead>{t('commons.action', '操作')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {files.map((file) => (
                                    <TableRow key={file.path}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {file.isDir ? <Folder className="size-4" /> : <File className="size-4" />}
                                                {file.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatSize(file.size)}</TableCell>
                                        <TableCell>{file.modTime}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                {!file.isDir && (
                                                    <Button size="sm" variant="ghost">
                                                        <Download className="size-4" />
                                                    </Button>
                                                )}
                                                <Button size="sm" variant="ghost" onClick={() => onDelete(file.path)}>
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
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

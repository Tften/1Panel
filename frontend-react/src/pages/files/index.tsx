import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { getFilesList, deleteFile, getFileContent, updateFileContent, downloadFileUrl, createFile, type FileInfo } from '@/api/file';
import { Folder, File, Trash2, Download, ArrowUp, Pencil } from 'lucide-react';

export default function FileManagerPage() {
    const { t } = useTranslation();
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [path, setPath] = useState('/');
    const [editing, setEditing] = useState('');
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getFilesList({ path, page: 1, pageSize: 100 })
            .then((res) => setFiles(res.data.items || []))
            .catch((error) => toast.error(String(error)))
            .finally(() => setLoading(false));
    }, [path]);

    const onDelete = async (file: FileInfo) => {
        if (!window.confirm(t('commons.confirmDelete', '确定删除？'))) return;
        try {
            await deleteFile({ path: file.path, isDir: file.isDir, forceDelete: true });
            toast.success(t('commons.msg.deleteSuccess', '删除成功'));
            setFiles((prev) => prev.filter((item) => item.path !== file.path));
        } catch (error) {
            toast.error(String(error));
        }
    };

    const onEdit = async (file: FileInfo) => {
        try {
            const res = await getFileContent(file.path);
            setContent(res.data.content || '');
            setEditing(file.path);
        } catch (error) {
            toast.error(String(error));
        }
    };

    const onSave = async () => {
        setSaving(true);
        try {
            await updateFileContent(editing, content);
            setEditing('');
            toast.success(t('commons.msg.saveSuccess', '保存成功'));
        } catch (error) {
            toast.error(String(error));
        } finally {
            setSaving(false);
        }
    };

    const onCreateDirectory = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const name = String(form.get('name') || '').trim();
        if (!name) return;
        try {
            await createFile({ path: `${path === '/' ? '' : path}/${name}`, isDir: true });
            const res = await getFilesList({ path, page: 1, pageSize: 100 });
            setFiles(res.data.items || []);
            event.currentTarget.reset();
            toast.success(t('commons.msg.createSuccess', '创建成功'));
        } catch (error) {
            toast.error(String(error));
        }
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            <h1 className="text-2xl font-bold">{t('menu.files', '文件管理')}</h1>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="font-mono text-sm">{path}</CardTitle>
                    {path !== '/' && <Button variant="outline" size="sm" onClick={() => setPath(path.split('/').slice(0, -1).join('/') || '/')}><ArrowUp data-icon="inline-start" />{t('commons.back', '返回')}</Button>}
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <form onSubmit={onCreateDirectory} className="flex max-w-sm gap-2">
                        <Input name="name" placeholder={t('file.newFolder', '新建目录')} required />
                        <Button type="submit">{t('commons.create', '创建')}</Button>
                    </form>
                    {loading ? <Skeleton className="h-64 w-full" /> : (
                        <Table>
                            <TableHeader><TableRow><TableHead>{t('file.name', '名称')}</TableHead><TableHead>{t('file.size', '大小')}</TableHead><TableHead>{t('file.modTime', '修改时间')}</TableHead><TableHead>{t('commons.action', '操作')}</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {files.map((file) => (
                                    <TableRow key={file.path}>
                                        <TableCell className="font-medium">
                                            {file.isDir ? <button type="button" className="flex items-center gap-2" onClick={() => setPath(file.path)}><Folder />{file.name}</button> : <span className="flex items-center gap-2"><File />{file.name}</span>}
                                        </TableCell>
                                        <TableCell>{file.isDir ? '-' : formatSize(file.size)}</TableCell>
                                        <TableCell>{file.modTime}</TableCell>
                                        <TableCell><div className="flex gap-1">
                                            {!file.isDir && <><Button size="sm" variant="ghost" onClick={() => onEdit(file)}><Pencil /></Button><a href={downloadFileUrl(file.path)} target="_blank" rel="noreferrer"><Button size="sm" variant="ghost" type="button"><Download /></Button></a></>}
                                            <Button size="sm" variant="ghost" onClick={() => onDelete(file)}><Trash2 /></Button>
                                        </div></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                    {editing && <div className="flex flex-col gap-2">
                        <LabelText path={editing} />
                        <Textarea value={content} onChange={(event) => setContent(event.target.value)} className="min-h-80 font-mono" />
                        <div className="flex gap-2"><Button onClick={onSave} disabled={saving}>{t('commons.button.save', '保存')}</Button><Button variant="outline" onClick={() => setEditing('')}>{t('commons.button.cancel', '取消')}</Button></div>
                    </div>}
                </CardContent>
            </Card>
        </div>
    );
}

function formatSize(size: number) {
    if (size === 0) return '0 B';
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return `${(size / Math.pow(1024, i)).toFixed(2)} ${['B', 'KB', 'MB', 'GB'][i]}`;
}

function LabelText({ path }: { path: string }) {
    return <span className="font-mono text-sm">{path}</span>;
}

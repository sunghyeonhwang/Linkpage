import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import { Plus, GripVertical, Pencil, Trash2, ExternalLink, Check, X } from 'lucide-react';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Toggle from '../../components/atoms/Toggle';
import Spinner from '../../components/atoms/Spinner';
import { useProfileStore } from '../../stores/profileStore';
import { useLinkStore } from '../../stores/linkStore';
import type { ProfileLink } from '@linkpage/shared';

export default function LinksPage() {
  const { currentProfileId, fetchProfiles } = useProfileStore();
  const { links, loading, fetchLinks, createLink, updateLink, deleteLink, reorderLinks } = useLinkStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (currentProfileId) {
      fetchLinks(currentProfileId);
    }
  }, [currentProfileId]);

  const handleAddLink = async (data: { label: string; url: string; description?: string }) => {
    if (!currentProfileId) return;
    try {
      await createLink(currentProfileId, data);
      setShowAdd(false);
      toast.success('링크가 추가되었습니다');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || '링크 추가에 실패했습니다');
    }
  };

  const handleUpdateLink = async (linkId: string, data: Partial<ProfileLink>) => {
    if (!currentProfileId) return;
    try {
      await updateLink(currentProfileId, linkId, data);
      setEditingId(null);
      toast.success('링크가 수정되었습니다');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || '링크 수정에 실패했습니다');
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!currentProfileId) return;
    if (!confirm('이 링크를 삭제하시겠습니까?')) return;
    try {
      await deleteLink(currentProfileId, linkId);
      toast.success('링크가 삭제되었습니다');
    } catch {
      toast.error('링크 삭제에 실패했습니다');
    }
  };

  const handleToggle = async (linkId: string, isActive: boolean) => {
    if (!currentProfileId) return;
    await updateLink(currentProfileId, linkId, { is_active: isActive });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !currentProfileId) return;
    const items = Array.from(links);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    reorderLinks(currentProfileId, items);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">링크 관리</h2>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-1.5" />링크 추가
        </Button>
      </div>

      {showAdd && (
        <LinkEditor
          onSave={handleAddLink}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {links.length === 0 && !showAdd ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 mb-4">아직 링크가 없습니다</p>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4 mr-1.5" />첫 번째 링크 추가
          </Button>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="links">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {links.map((link, index) => (
                  <Draggable key={link.id} draggableId={link.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-white rounded-xl border transition-shadow ${
                          snapshot.isDragging ? 'border-primary-300 shadow-lg' : 'border-gray-200'
                        }`}
                      >
                        {editingId === link.id ? (
                          <div className="p-4">
                            <LinkEditor
                              initialData={link}
                              onSave={(data) => handleUpdateLink(link.id, data)}
                              onCancel={() => setEditingId(null)}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-4">
                            <div {...provided.dragHandleProps} className="cursor-grab text-gray-400 hover:text-gray-600">
                              <GripVertical className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${link.is_active ? 'text-gray-900' : 'text-gray-400'}`}>
                                {link.label}
                              </p>
                              <p className="text-xs text-gray-400 truncate">{link.url}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Toggle
                                checked={link.is_active}
                                onChange={(v) => handleToggle(link.id, v)}
                                size="sm"
                              />
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => setEditingId(link.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteLink(link.id)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}

function LinkEditor({
  initialData,
  onSave,
  onCancel,
}: {
  initialData?: Partial<ProfileLink>;
  onSave: (data: { label: string; url: string; description?: string }) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(initialData?.label || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [description, setDescription] = useState(initialData?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !url.trim()) return;
    onSave({
      label: label.trim(),
      url: url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`,
      description: description.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <Input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="링크 제목"
        autoFocus
      />
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com"
      />
      <Input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="설명 (선택)"
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4 mr-1" />취소
        </Button>
        <Button type="submit" size="sm" disabled={!label.trim() || !url.trim()}>
          <Check className="w-4 h-4 mr-1" />저장
        </Button>
      </div>
    </form>
  );
}

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../common/AdminLayout';
import {
  Tags,
  Plus,
  FolderTree,
  ChevronRight,
  ChevronDown,
  Layers,
  Sparkles,
  Sofa,
  Bed,
  Utensils,
  Briefcase,
  Lamp,
  Box,
  Trash2,
  Edit2,
  CheckCircle2,
  Search,
  ArrowRight,
  X,
  PlusCircle,
  Eye,
  Info,
} from 'lucide-react';
import {
  RoomCategory,
  SubCategory,
  ChildCategory,
  getStoredCategories,
  saveStoredCategories,
  INITIAL_ROOM_CATEGORIES,
} from '@/lib/categoryData';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<RoomCategory[]>(INITIAL_ROOM_CATEGORIES);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('room-living');
  const [expandedSubIds, setExpandedSubIds] = useState<string[]>(['sub-sofas', 'sub-beds']);
  const [viewMode, setViewMode] = useState<'room-explorer' | 'tree-view'>('room-explorer');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalLevel, setModalLevel] = useState<'room' | 'subcategory' | 'child'>('subcategory');
  const [selectedParentRoomId, setSelectedParentRoomId] = useState<string>('room-living');
  const [selectedParentSubId, setSelectedParentSubId] = useState<string>('');

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIcon, setFormIcon] = useState('');

  // Load from storage
  useEffect(() => {
    const loaded = getStoredCategories();
    setCategories(loaded);
    if (loaded.length > 0 && !loaded.some((r) => r.id === selectedRoomId)) {
      setSelectedRoomId(loaded[0].id);
    }
  }, []);

  const selectedRoom = useMemo(() => {
    return categories.find((r) => r.id === selectedRoomId) || categories[0];
  }, [categories, selectedRoomId]);

  const toggleSubExpanded = (subId: string) => {
    setExpandedSubIds((prev) =>
      prev.includes(subId) ? prev.filter((id) => id !== subId) : [...prev, subId]
    );
  };

  const getRoomIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sofa':
        return <Sofa size={18} />;
      case 'Bed':
        return <Bed size={18} />;
      case 'Utensils':
        return <Utensils size={18} />;
      case 'Briefcase':
        return <Briefcase size={18} />;
      case 'Lamp':
        return <Lamp size={18} />;
      default:
        return <Layers size={18} />;
    }
  };

  const openCreateModal = (
    level: 'room' | 'subcategory' | 'child',
    parentRoomId?: string,
    parentSubId?: string
  ) => {
    setModalLevel(level);
    setSelectedParentRoomId(parentRoomId || selectedRoomId);
    setSelectedParentSubId(parentSubId || '');
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormIcon('');
    setShowAddModal(true);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    setFormSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Please enter a name');
      return;
    }

    const newSlug = formSlug.trim() || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const updated = JSON.parse(JSON.stringify(categories)) as RoomCategory[];

    if (modalLevel === 'room') {
      const newRoom: RoomCategory = {
        id: `room-${Date.now()}`,
        name: formName.trim(),
        slug: newSlug,
        iconName: formIcon || 'Layers',
        description: formDescription.trim() || 'Room collection for furniture catalog.',
        colorScheme: 'from-primary/20 to-emerald-500/10 text-primary',
        status: 'Active',
        subCategories: [],
      };
      updated.push(newRoom);
      toast.success(`Room "${newRoom.name}" created!`);
      setSelectedRoomId(newRoom.id);
    } else if (modalLevel === 'subcategory') {
      const roomIndex = updated.findIndex((r) => r.id === selectedParentRoomId);
      if (roomIndex === -1) {
        toast.error('Parent room not found');
        return;
      }
      const newSub: SubCategory = {
        id: `sub-${Date.now()}`,
        name: formName.trim(),
        slug: newSlug,
        description: formDescription.trim(),
        itemCount: 0,
        status: 'Active',
        childCategories: [],
      };
      updated[roomIndex].subCategories.push(newSub);
      toast.success(`Subcategory "${newSub.name}" added to ${updated[roomIndex].name}!`);
      if (!expandedSubIds.includes(newSub.id)) {
        setExpandedSubIds((prev) => [...prev, newSub.id]);
      }
    } else if (modalLevel === 'child') {
      const roomIndex = updated.findIndex((r) => r.id === selectedParentRoomId);
      if (roomIndex === -1) {
        toast.error('Parent room not found');
        return;
      }
      const subIndex = updated[roomIndex].subCategories.findIndex(
        (s) => s.id === selectedParentSubId
      );
      if (subIndex === -1) {
        toast.error('Please select a parent subcategory');
        return;
      }
      const newChild: ChildCategory = {
        id: `child-${Date.now()}`,
        name: formName.trim(),
        slug: newSlug,
        description: formDescription.trim(),
        itemCount: 0,
        status: 'Active',
      };
      updated[roomIndex].subCategories[subIndex].childCategories.push(newChild);
      toast.success(
        `Child Category "${newChild.name}" added under ${updated[roomIndex].subCategories[subIndex].name}!`
      );
      if (!expandedSubIds.includes(selectedParentSubId)) {
        setExpandedSubIds((prev) => [...prev, selectedParentSubId]);
      }
    }

    setCategories(updated);
    saveStoredCategories(updated);
    setShowAddModal(false);
  };

  const handleDeleteChildCategory = (roomId: string, subId: string, childId: string) => {
    const updated = JSON.parse(JSON.stringify(categories)) as RoomCategory[];
    const room = updated.find((r) => r.id === roomId);
    if (room) {
      const sub = room.subCategories.find((s) => s.id === subId);
      if (sub) {
        sub.childCategories = sub.childCategories.filter((c) => c.id !== childId);
        setCategories(updated);
        saveStoredCategories(updated);
        toast.success('Child category removed.');
      }
    }
  };

  // Stats
  const totalRooms = categories.length;
  const totalSubcategories = categories.reduce((sum, r) => sum + r.subCategories.length, 0);
  const totalChildCategories = categories.reduce(
    (sum, r) => sum + r.subCategories.reduce((s2, sub) => s2 + sub.childCategories.length, 0),
    0
  );

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-textColor tracking-tight">
                3-Tier Category Taxonomy
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                Hierarchy
              </span>
            </div>
            <p className="text-xs sm:text-sm text-textMuted mt-0.5">
              Level 1: <strong className="text-textColor">Room</strong> &rarr; Level 2:{' '}
              <strong className="text-textColor">Subcategory (in Room)</strong> &rarr; Level 3:{' '}
              <strong className="text-textColor">Child Category</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-surfaceColor rounded-xl border border-borderColor">
              <button
                onClick={() => setViewMode('room-explorer')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === 'room-explorer'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-textMuted hover:text-textColor'
                }`}
              >
                <Layers size={14} />
                <span>Room Explorer</span>
              </button>
              <button
                onClick={() => setViewMode('tree-view')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === 'tree-view'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-textMuted hover:text-textColor'
                }`}
              >
                <FolderTree size={14} />
                <span>Full Hierarchy Tree</span>
              </button>
            </div>

            <button
              onClick={() => openCreateModal('room')}
              className="px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover font-bold text-xs flex items-center gap-2 shadow-xs shadow-primary/30"
            >
              <Plus size={16} />
              <span>New Category</span>
            </button>
          </div>
        </div>

        {/* 3-Tier Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-surfaceColor border border-borderColor flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted block">
                Tier 1 &bull; Rooms
              </span>
              <span className="text-2xl font-black text-textColor">{totalRooms} Rooms</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Sofa size={20} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surfaceColor border border-borderColor flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted block">
                Tier 2 &bull; Subcategories in Rooms
              </span>
              <span className="text-2xl font-black text-textColor">
                {totalSubcategories} Categories
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <Layers size={20} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surfaceColor border border-borderColor flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted block">
                Tier 3 &bull; Child Categories
              </span>
              <span className="text-2xl font-black text-textColor">
                {totalChildCategories} Child Types
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <Sparkles size={20} />
            </div>
          </div>
        </div>

        {/* VIEW 1: ROOM EXPLORER VIEW */}
        {viewMode === 'room-explorer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Room Categories (Tier 1) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-textMuted uppercase tracking-wider">
                  Tier 1: Select Room
                </span>
                <button
                  onClick={() => openCreateModal('room')}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <Plus size={13} />
                  <span>Add Room</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {categories.map((room) => {
                  const isSelected = room.id === selectedRoomId;
                  const subCount = room.subCategories.length;
                  const childCount = room.subCategories.reduce(
                    (s, sub) => s + sub.childCategories.length,
                    0
                  );

                  return (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isSelected
                          ? 'bg-surfaceColor border-primary shadow-md shadow-primary/10 ring-1 ring-primary/30'
                          : 'bg-surfaceColor/70 border-borderColor hover:border-primary/40 hover:bg-surfaceColor'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                            isSelected
                              ? 'bg-primary text-white shadow-xs shadow-primary/30'
                              : 'bg-bgColor text-textMuted border border-borderColor'
                          }`}
                        >
                          {getRoomIcon(room.iconName)}
                        </div>
                        <div>
                          <h3
                            className={`font-bold text-sm leading-tight transition-colors ${
                              isSelected ? 'text-primary font-black' : 'text-textColor'
                            }`}
                          >
                            {room.name}
                          </h3>
                          <span className="text-[11px] text-textMuted block mt-0.5">
                            {subCount} subcategories &bull; {childCount} child types
                          </span>
                        </div>
                      </div>

                      <ChevronRight
                        size={18}
                        className={`transition-transform ${
                          isSelected ? 'text-primary translate-x-1' : 'text-textMuted/60'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Subcategories (Tier 2) & Child Categories (Tier 3) in Selected Room */}
            <div className="lg:col-span-8 space-y-4">
              {selectedRoom && (
                <div className="p-6 rounded-2xl bg-surfaceColor border border-borderColor shadow-xs space-y-6">
                  {/* Selected Room Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-borderColor">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {getRoomIcon(selectedRoom.iconName)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-black text-textColor">
                            {selectedRoom.name}
                          </h2>
                          <span className="text-[10px] font-mono text-primary/80 px-2 py-0.5 rounded-md bg-primary/5 border border-primary/10">
                            /{selectedRoom.slug}
                          </span>
                        </div>
                        <p className="text-xs text-textMuted mt-0.5">
                          {selectedRoom.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openCreateModal('subcategory', selectedRoom.id)}
                        className="px-3.5 py-2 rounded-xl bg-primary text-white hover:bg-primary-hover font-bold text-xs flex items-center gap-1.5 shadow-xs shadow-primary/20"
                      >
                        <Plus size={14} />
                        <span>Add Subcategory to Room</span>
                      </button>
                    </div>
                  </div>

                  {/* Subcategory List with Child Categories */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-textMuted uppercase tracking-wider">
                        Product Subcategories present in {selectedRoom.name}
                      </span>
                      <span className="text-xs text-textMuted">
                        {selectedRoom.subCategories.length} Categories
                      </span>
                    </div>

                    {selectedRoom.subCategories.length === 0 ? (
                      <div className="py-12 text-center rounded-2xl bg-bgColor/40 border border-dashed border-borderColor">
                        <Box size={32} className="mx-auto text-textMuted/40 mb-2" />
                        <p className="text-sm font-bold text-textColor">No subcategories yet</p>
                        <p className="text-xs text-textMuted mt-0.5">
                          Add the first product category present in this room.
                        </p>
                        <button
                          onClick={() => openCreateModal('subcategory', selectedRoom.id)}
                          className="mt-3 px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold inline-flex items-center gap-1.5"
                        >
                          <Plus size={14} />
                          <span>Add Subcategory</span>
                        </button>
                      </div>
                    ) : (
                      selectedRoom.subCategories.map((sub) => {
                        const isExpanded = expandedSubIds.includes(sub.id);
                        return (
                          <div
                            key={sub.id}
                            className="rounded-2xl bg-bgColor/50 border border-borderColor overflow-hidden transition-all hover:border-primary/30"
                          >
                            {/* Subcategory Header */}
                            <div className="p-4 flex items-center justify-between cursor-pointer">
                              <div
                                className="flex items-center gap-3 flex-1"
                                onClick={() => toggleSubExpanded(sub.id)}
                              >
                                <button className="p-1 rounded-lg hover:bg-surfaceColor text-textMuted">
                                  {isExpanded ? (
                                    <ChevronDown size={16} />
                                  ) : (
                                    <ChevronRight size={16} />
                                  )}
                                </button>
                                <div className="w-8 h-8 rounded-lg bg-surfaceColor border border-borderColor flex items-center justify-center text-primary font-bold text-xs">
                                  <Layers size={15} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-xs sm:text-sm text-textColor">
                                      {sub.name}
                                    </h4>
                                    <span className="text-[10px] font-mono text-textMuted">
                                      /{sub.slug}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-textMuted">
                                    {sub.childCategories.length} child categories &bull;{' '}
                                    {sub.itemCount} live items
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openCreateModal('child', selectedRoom.id, sub.id);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-surfaceColor border border-borderColor hover:border-primary/40 text-primary text-[11px] font-bold flex items-center gap-1 transition-colors"
                                >
                                  <Plus size={12} />
                                  <span>Add Child Category</span>
                                </button>
                              </div>
                            </div>

                            {/* Child Categories (Tier 3) Area */}
                            {isExpanded && (
                              <div className="px-5 py-4 bg-surfaceColor/80 border-t border-borderColor space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
                                    Child Categories in {sub.name}
                                  </span>
                                  <span className="text-[10px] text-textMuted">
                                    Specific product variations &amp; subtypes
                                  </span>
                                </div>

                                {sub.childCategories.length === 0 ? (
                                  <p className="text-xs text-textMuted italic py-1">
                                    No child categories created yet under {sub.name}. Click &quot;Add
                                    Child Category&quot; to create granular product filters.
                                  </p>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {sub.childCategories.map((child) => (
                                      <div
                                        key={child.id}
                                        className="p-3 rounded-xl bg-bgColor border border-borderColor flex items-center justify-between group hover:border-primary/30 transition-all"
                                      >
                                        <div className="flex items-center gap-2.5">
                                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                          <div>
                                            <span className="text-xs font-bold text-textColor block leading-tight">
                                              {child.name}
                                            </span>
                                            <span className="text-[10px] font-mono text-textMuted">
                                              /{child.slug} &bull; {child.itemCount} items
                                            </span>
                                          </div>
                                        </div>

                                        <button
                                          onClick={() =>
                                            handleDeleteChildCategory(
                                              selectedRoom.id,
                                              sub.id,
                                              child.id
                                            )
                                          }
                                          className="opacity-0 group-hover:opacity-100 p-1 text-textMuted hover:text-red-500 transition-all"
                                          title="Remove child category"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: FULL HIERARCHY TREE VIEW */}
        {viewMode === 'tree-view' && (
          <div className="p-6 rounded-2xl bg-surfaceColor border border-borderColor shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-black text-textColor">
                Comprehensive 3-Tier Taxonomy Tree
              </h2>
              <p className="text-xs text-textMuted">
                Full nesting view of Rooms, Subcategories, and Child Categories across the entire
                storefront.
              </p>
            </div>

            <div className="space-y-6">
              {categories.map((room) => (
                <div key={room.id} className="p-5 rounded-2xl bg-bgColor/50 border border-borderColor space-y-4">
                  {/* Tier 1 Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {getRoomIcon(room.iconName)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">
                            Tier 1: Room
                          </span>
                          <h3 className="font-bold text-sm text-textColor">{room.name}</h3>
                        </div>
                        <span className="text-xs text-textMuted">{room.description}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => openCreateModal('subcategory', room.id)}
                      className="px-3 py-1 rounded-lg bg-surfaceColor border border-borderColor text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all flex items-center gap-1"
                    >
                      <Plus size={12} />
                      <span>Add Subcategory</span>
                    </button>
                  </div>

                  {/* Tier 2 & Tier 3 Tree */}
                  <div className="pl-6 border-l-2 border-primary/20 space-y-3 ml-5">
                    {room.subCategories.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3.5 rounded-xl bg-surfaceColor border border-borderColor space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 uppercase">
                              Tier 2: Subcategory
                            </span>
                            <span className="font-bold text-xs text-textColor">{sub.name}</span>
                            <span className="text-[10px] font-mono text-textMuted">
                              (slug: {sub.slug})
                            </span>
                          </div>

                          <button
                            onClick={() => openCreateModal('child', room.id, sub.id)}
                            className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                          >
                            <Plus size={11} />
                            <span>Add Child</span>
                          </button>
                        </div>

                        {/* Tier 3 Badges */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {sub.childCategories.map((child) => (
                            <span
                              key={child.id}
                              className="px-2.5 py-1 rounded-lg bg-bgColor border border-borderColor text-[11px] font-semibold text-textColor flex items-center gap-1.5"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>{child.name}</span>
                              <span className="text-[9px] text-textMuted font-mono">
                                ({child.slug})
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL: CREATE / ADD CATEGORY FORM */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />

            <div className="relative bg-surfaceColor rounded-2xl border border-borderColor shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-borderColor">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Plus size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-textColor">
                      Create{' '}
                      {modalLevel === 'room'
                        ? 'Room (Tier 1)'
                        : modalLevel === 'subcategory'
                        ? 'Subcategory (Tier 2)'
                        : 'Child Category (Tier 3)'}
                    </h3>
                    <p className="text-xs text-textMuted">
                      Add to Urbn Furnish 3-tier taxonomy
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg text-textMuted hover:text-textColor hover:bg-bgColor"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tier Switcher inside modal */}
              <div className="flex items-center gap-1 px-6 py-2.5 bg-bgColor/40 border-b border-borderColor">
                {(['room', 'subcategory', 'child'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setModalLevel(lvl)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                      modalLevel === lvl
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-textMuted hover:text-textColor'
                    }`}
                  >
                    {lvl === 'room' ? '1. Room' : lvl === 'subcategory' ? '2. Subcategory' : '3. Child Category'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
                {/* Parent Selectors */}
                {modalLevel !== 'room' && (
                  <div>
                    <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-1.5">
                      Parent Room *
                    </label>
                    <select
                      value={selectedParentRoomId}
                      onChange={(e) => setSelectedParentRoomId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-bgColor rounded-xl border border-borderColor text-xs font-semibold text-textColor outline-none focus:border-primary"
                    >
                      {categories.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {modalLevel === 'child' && (
                  <div>
                    <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-1.5">
                      Parent Subcategory *
                    </label>
                    <select
                      value={selectedParentSubId}
                      onChange={(e) => setSelectedParentSubId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-bgColor rounded-xl border border-borderColor text-xs font-semibold text-textColor outline-none focus:border-primary"
                    >
                      <option value="">-- Select Subcategory --</option>
                      {categories
                        .find((r) => r.id === selectedParentRoomId)
                        ?.subCategories.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-1.5">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      modalLevel === 'room'
                        ? 'e.g. Balcony & Garden'
                        : modalLevel === 'subcategory'
                        ? 'e.g. Coffee Tables'
                        : 'e.g. Nesting Tables'
                    }
                    value={formName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-bgColor rounded-xl border border-borderColor text-xs font-semibold text-textColor outline-none focus:border-primary"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    placeholder="auto-generated-slug"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-bgColor rounded-xl border border-borderColor text-xs font-mono text-textColor outline-none focus:border-primary"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Short description of this category tier..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-bgColor rounded-xl border border-borderColor text-xs text-textColor outline-none focus:border-primary resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-borderColor">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-bgColor border border-borderColor text-xs font-bold text-textColor hover:bg-sidebarHover"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover text-xs font-bold shadow-sm shadow-primary/30"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

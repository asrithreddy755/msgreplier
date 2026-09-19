"use client";

import { useState, useEffect, useMemo } from 'react';
import { 
    Lock, Loader2, ShieldAlert, Key, Users, MessageSquareHeart, 
    Gift, Search, Copy, ExternalLink, Calendar, Heart, 
    RefreshCw, ChevronDown, ChevronUp, LogOut, CheckCircle, Sparkles,
    Image as ImageIcon, Mail, Trash2, CheckSquare, Square, AlertTriangle, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, 
    DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminRoom {
    id: string;
    room_code: string;
    created_at: string;
    last_activity_at: string;
    is_active: boolean;
}

interface AdminMember {
    id: string;
    room_id: string;
    nickname: string;
    joined_at: string;
}

interface AdminMessage {
    id: string;
    room_id: string;
    sender_nickname: string;
    message: string;
    created_at: string;
}

interface AdminGreeting {
    id: string;
    slug: string;
    sender_name: string;
    recipient_name: string;
    relationship: string;
    occasion: string;
    message: string;
    theme: string;
    sender_avatar: string;
    photo_url: string;
    music_id: string;
    reveal_type: string;
    created_at: string;
    user_id?: string;
}

interface R2Image {
    key: string;
    url: string;
    size: number;
    lastModified: string | null;
    userId: string | null;
    email: string | null;
}

export default function AdminPage() {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoginLoading, setIsLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    // Data states
    const [rooms, setRooms] = useState<AdminRoom[]>([]);
    const [members, setMembers] = useState<AdminMember[]>([]);
    const [messages, setMessages] = useState<AdminMessage[]>([]);
    const [greetings, setGreetings] = useState<AdminGreeting[]>([]);
    const [profiles, setProfiles] = useState<{ id: string; email: string }[]>([]);
    const [gallery, setGallery] = useState<{ id: string; user_id: string; image_url: string; created_at: string }[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Search and filters
    const [roomSearch, setRoomSearch] = useState('');
    const [greetingSearch, setGreetingSearch] = useState('');
    const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
    const [activeGreetingId, setActiveGreetingId] = useState<string | null>(null);

    // Pagination / Load More states
    const [visibleRoomsCount, setVisibleRoomsCount] = useState(50);
    const [visibleGreetingsCount, setVisibleGreetingsCount] = useState(50);

    // R2 storage images states
    const [r2Images, setR2Images] = useState<R2Image[]>([]);
    const [r2ContinuationToken, setR2ContinuationToken] = useState<string | null>(null);
    const [isR2Loading, setIsR2Loading] = useState(false);
    const [r2Search, setR2Search] = useState('');
    const [r2Error, setR2Error] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('rooms');

    // Gmail Inspector states
    const [gmailSearchInput, setGmailSearchInput] = useState('');
    const [activeInspectorGmail, setActiveInspectorGmail] = useState('');

    // Selection & Delete state for Wishes
    const [selectedWishIds, setSelectedWishIds] = useState<Set<string>>(new Set());
    const [wishIdsToDelete, setWishIdsToDelete] = useState<string[] | null>(null);
    const [isDeletingWishes, setIsDeletingWishes] = useState(false);

    // Reset visible counts when search filter changes
    useEffect(() => {
        setVisibleRoomsCount(50);
    }, [roomSearch]);

    useEffect(() => {
        setVisibleGreetingsCount(50);
    }, [greetingSearch]);

    // Auto-login if password is saved in sessionStorage
    useEffect(() => {
        const savedPassword = sessionStorage.getItem('msgreplier_admin_token');
        if (savedPassword) {
            handleLogin(savedPassword);
        }
    }, []);

    const handleLogin = async (passToTry?: string) => {
        const activePassword = passToTry || password;
        if (!activePassword.trim()) {
            setLoginError('Password is required');
            return;
        }

        setIsLoginLoading(true);
        setLoginError(null);

        try {
            const res = await fetch('/api/admin/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: activePassword })
            });

            const data = await res.json();

            if (res.ok) {
                setIsAuthenticated(true);
                sessionStorage.setItem('msgreplier_admin_token', activePassword);
                setRooms(data.rooms);
                setMembers(data.members);
                setMessages(data.messages);
                setGreetings(data.greetings);
                setProfiles(data.profiles || []);
                setGallery(data.gallery || []);
                toast.success('Successfully authenticated as Administrator!');
            } else {
                setLoginError(data.error || 'Invalid administrator password.');
                sessionStorage.removeItem('msgreplier_admin_token');
            }
        } catch (error) {
            setLoginError('Network error connecting to API.');
        } finally {
            setIsLoginLoading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('msgreplier_admin_token');
        setIsAuthenticated(false);
        setPassword('');
        setRooms([]);
        setMembers([]);
        setMessages([]);
        setGreetings([]);
        setProfiles([]);
        setGallery([]);
        setR2Images([]);
        setR2ContinuationToken(null);
        setR2Search('');
        setR2Error(null);
        setActiveTab('rooms');
        setSelectedWishIds(new Set());
        setWishIdsToDelete(null);
        setGmailSearchInput('');
        setActiveInspectorGmail('');
        toast.info('Logged out from admin panel.');
    };

    const loadR2Images = async (token?: string, clearExisting = false) => {
        const savedPassword = sessionStorage.getItem('msgreplier_admin_token');
        if (!savedPassword) return;

        setIsR2Loading(true);
        setR2Error(null);
        try {
            const res = await fetch('/api/admin/r2-images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password: savedPassword,
                    continuationToken: token || null,
                    limit: 48
                })
            });

            const data = await res.json();
            if (res.ok) {
                setR2Images(prev => clearExisting ? data.images : [...prev, ...data.images]);
                setR2ContinuationToken(data.nextContinuationToken);
            } else {
                setR2Error(data.error || 'Failed to fetch R2 images');
                toast.error(data.error || 'Failed to fetch R2 images');
            }
        } catch (err) {
            setR2Error('Network error fetching R2 images');
            toast.error('Network error fetching R2 images');
        } finally {
            setIsR2Loading(false);
        }
    };

    const refreshData = async () => {
        const savedPassword = sessionStorage.getItem('msgreplier_admin_token');
        if (!savedPassword) return;

        setIsLoadingData(true);
        try {
            const res = await fetch('/api/admin/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: savedPassword })
            });
            const data = await res.json();
            if (res.ok) {
                setRooms(data.rooms);
                setMembers(data.members);
                setMessages(data.messages);
                setGreetings(data.greetings);
                setProfiles(data.profiles || []);
                setGallery(data.gallery || []);
                
                if (activeTab === 'r2-images' || r2Images.length > 0) {
                    await loadR2Images(undefined, true);
                }
                
                toast.success('Admin records refreshed successfully!');
            }
        } catch {
            toast.error('Failed to refresh data.');
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        if (value === 'r2-images' && r2Images.length === 0) {
            loadR2Images(undefined, true);
        }
    };

    // Copy to clipboard helper
    const copyText = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    };

    // Delete Wishes handler
    const handleDeleteWishes = async (idsToDelete: string[]) => {
        if (!idsToDelete || idsToDelete.length === 0) return;
        const savedPassword = sessionStorage.getItem('msgreplier_admin_token');
        if (!savedPassword) {
            toast.error('Session expired. Please log in again.');
            return;
        }

        setIsDeletingWishes(true);
        try {
            const res = await fetch('/api/admin/delete-wishes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password: savedPassword,
                    ids: idsToDelete
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(`Successfully deleted ${idsToDelete.length} wish(es)!`);
                setGreetings(prev => prev.filter(g => !idsToDelete.includes(g.id)));
                setSelectedWishIds(prev => {
                    const next = new Set(prev);
                    idsToDelete.forEach(id => next.delete(id));
                    return next;
                });
                setWishIdsToDelete(null);
            } else {
                toast.error(data.error || 'Failed to delete wishes');
            }
        } catch (err) {
            toast.error('Network error deleting wishes');
        } finally {
            setIsDeletingWishes(false);
        }
    };

    // Toggle individual wish selection
    const toggleSelectWish = (id: string) => {
        setSelectedWishIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    // Toggle select all wishes for a list
    const toggleSelectAllWishes = (wishesList: AdminGreeting[]) => {
        const wishIds = wishesList.map(w => w.id);
        const allSelected = wishIds.length > 0 && wishIds.every(id => selectedWishIds.has(id));
        
        setSelectedWishIds(prev => {
            const next = new Set(prev);
            if (allSelected) {
                wishIds.forEach(id => next.delete(id));
            } else {
                wishIds.forEach(id => next.add(id));
            }
            return next;
        });
    };

    // Gather list of unique Gmails/emails across profiles & R2 images
    const allKnownGmails = useMemo(() => {
        const emailsSet = new Set<string>();
        profiles.forEach(p => {
            if (p.email) emailsSet.add(p.email);
        });
        r2Images.forEach(img => {
            if (img.email) emailsSet.add(img.email);
        });
        return Array.from(emailsSet).sort();
    }, [profiles, r2Images]);

    // Inspector data for active Gmail
    const inspectedUserData = useMemo(() => {
        if (!activeInspectorGmail.trim()) return null;
        const targetEmail = activeInspectorGmail.trim().toLowerCase();

        // 1. Find profile
        const profile = profiles.find(p => p.email?.toLowerCase() === targetEmail);
        const userId = profile?.id;

        // 2. Gather gallery pictures (from Supabase DB gallery & R2 bucket)
        const dbGalleryItems = gallery.filter(img => userId && img.user_id === userId);
        const r2GalleryItems = r2Images.filter(img => 
            img.email?.toLowerCase() === targetEmail || (userId && img.userId === userId)
        );

        // Map into unified gallery image list
        const galleryPictures: { id: string; url: string; source: 'Database' | 'R2 Storage'; created_at?: string }[] = [];
        const seenUrls = new Set<string>();

        dbGalleryItems.forEach(img => {
            if (!seenUrls.has(img.image_url)) {
                seenUrls.add(img.image_url);
                galleryPictures.push({
                    id: img.id,
                    url: img.image_url,
                    source: 'Database',
                    created_at: img.created_at
                });
            }
        });

        r2GalleryItems.forEach(img => {
            if (!seenUrls.has(img.url)) {
                seenUrls.add(img.url);
                galleryPictures.push({
                    id: img.key,
                    url: img.url,
                    source: 'R2 Storage',
                    created_at: img.lastModified || undefined
                });
            }
        });

        // 3. Gather user's wishes/greetings
        const userWishes = greetings.filter(g => {
            if (userId && g.user_id === userId) return true;
            const greetingUserEmail = profiles.find(p => p.id === g.user_id)?.email?.toLowerCase();
            return greetingUserEmail === targetEmail;
        });

        return {
            email: activeInspectorGmail.trim(),
            userId: userId || null,
            galleryPictures,
            userWishes
        };
    }, [activeInspectorGmail, profiles, gallery, r2Images, greetings]);

    const inspectGmail = (emailToInspect: string) => {
        setGmailSearchInput(emailToInspect);
        setActiveInspectorGmail(emailToInspect);
        setActiveTab('gmail-inspector');
    };

    const filteredR2Images = useMemo(() => {
        return r2Images.filter(img => {
            const search = r2Search.toLowerCase();
            const key = img.key.toLowerCase();
            const email = (img.email || '').toLowerCase();
            const userId = (img.userId || '').toLowerCase();
            return key.includes(search) || email.includes(search) || userId.includes(search);
        });
    }, [r2Images, r2Search]);

    const totalR2SizeLoaded = useMemo(() => {
        return r2Images.reduce((sum, img) => sum + img.size, 0);
    }, [r2Images]);

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Group members by room ID for fast lookup
    const roomMembersMap = useMemo(() => {
        const map = new Map<string, AdminMember[]>();
        members.forEach(member => {
            if (!map.has(member.room_id)) {
                map.set(member.room_id, []);
            }
            map.get(member.room_id)!.push(member);
        });
        return map;
    }, [members]);

    // Group messages by room ID
    const roomMessagesMap = useMemo(() => {
        const map = new Map<string, AdminMessage[]>();
        messages.forEach(msg => {
            if (!map.has(msg.room_id)) {
                map.set(msg.room_id, []);
            }
            map.get(msg.room_id)!.push(msg);
        });
        return map;
    }, [messages]);

    // Filtered rooms
    const filteredRooms = useMemo(() => {
        return rooms.filter(room => {
            const roomMembers = roomMembersMap.get(room.id) || [];
            const nicknames = roomMembers.map(m => m.nickname.toLowerCase()).join(' ');
            const code = room.room_code.toLowerCase();
            const search = roomSearch.toLowerCase();
            return nicknames.includes(search) || code.includes(search) || room.id.includes(search);
        });
    }, [rooms, roomSearch, roomMembersMap]);

    // Filtered greetings
    const filteredGreetings = useMemo(() => {
        return greetings.filter(g => {
            const sender = g.sender_name.toLowerCase();
            const recipient = g.recipient_name.toLowerCase();
            const occasion = g.occasion.toLowerCase();
            const userEmail = profiles.find(p => p.id === g.user_id)?.email?.toLowerCase() || '';
            const search = greetingSearch.toLowerCase();
            return sender.includes(search) || recipient.includes(search) || occasion.includes(search) || g.slug.includes(search) || userEmail.includes(search);
        });
    }, [greetings, greetingSearch, profiles]);

    // Render Login Interface
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-xl shadow-2xl overflow-hidden rounded-[2rem] border relative">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-rose-400 to-purple-600" />
                        <CardHeader className="text-center pt-8 pb-6">
                            <div className="w-16 h-16 bg-gradient-to-tr from-pink-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-pink-500/30">
                                <Key className="w-8 h-8 text-pink-400 animate-pulse" />
                            </div>
                            <CardTitle className="text-3xl font-extrabold text-white tracking-tight">Admin Portal</CardTitle>
                            <CardDescription className="text-slate-400 mt-2 text-sm font-medium">
                                Secure gateway to MsgReplier administrator panel.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
                            <form 
                                onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                        <Input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter Admin Password"
                                            className="pl-11 bg-slate-950/50 border-slate-800 focus:border-pink-500 focus:ring-pink-500/20 text-white rounded-xl py-6 text-base"
                                        />
                                    </div>
                                    {loginError && (
                                        <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5 mt-2">
                                            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                                            <span>{loginError}</span>
                                        </div>
                                    )}
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isLoginLoading}
                                    className="w-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold py-6 rounded-xl hover:opacity-95 shadow-lg shadow-pink-500/15 transition-all text-base flex items-center justify-center gap-2 active:scale-95"
                                >
                                    {isLoginLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Verifying Credentials...
                                        </>
                                    ) : (
                                        <>
                                            Unlock Dashboard
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    // Render Dashboard
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                            <Sparkles className="w-6 h-6 text-pink-500" />
                            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                                MsgReplier Management Suite
                            </h1>
                            <span className="text-[10px] font-bold tracking-widest uppercase bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded-full border border-pink-500/20">
                                Live Console
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm">
                            Manage private spaces, view live chat sessions, inspect Gmail galleries & delete wishes.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={refreshData}
                            disabled={isLoadingData}
                            className="bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 rounded-xl px-4 py-5 font-semibold text-sm flex items-center gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
                            Refresh Records
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleLogout}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 rounded-xl px-4 py-5 font-semibold text-sm flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-slate-900/40 border-slate-900 hover:border-pink-500/30 transition-all rounded-[1.5rem] shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-300">
                            <Users className="w-20 h-20 text-pink-500" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs font-bold uppercase tracking-wider text-pink-500">Love Spaces Created</CardDescription>
                            <CardTitle className="text-4xl font-extrabold text-white mt-1">{rooms.length}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                                <Heart className="w-3.5 h-3.5 text-pink-500" />
                                {rooms.filter(r => r.is_active).length} currently active spaces online
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/40 border-slate-900 hover:border-purple-500/30 transition-all rounded-[1.5rem] shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-300">
                            <MessageSquareHeart className="w-20 h-20 text-purple-500" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs font-bold uppercase tracking-wider text-purple-500">Messages Logged</CardDescription>
                            <CardTitle className="text-4xl font-extrabold text-white mt-1">{messages.length}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                                <MessageSquareHeart className="w-3.5 h-3.5 text-purple-500" />
                                Live message logs in the Supabase cache
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/40 border-slate-900 hover:border-indigo-500/30 transition-all rounded-[1.5rem] shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-300">
                            <Gift className="w-20 h-20 text-indigo-500" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs font-bold uppercase tracking-wider text-indigo-500">Greetings Sites Built</CardDescription>
                            <CardTitle className="text-4xl font-extrabold text-white mt-1">{greetings.length}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                                Custom Wishes Websites built by users
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Dashboard Tabs */}
                <Tabs defaultValue="rooms" value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="bg-slate-900/50 border border-slate-900/80 p-1.5 rounded-2xl w-full md:w-auto mb-6 flex gap-2 flex-wrap">
                        <TabsTrigger 
                            value="rooms"
                            className="flex-1 md:flex-initial rounded-xl px-6 py-3 text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-400 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                        >
                            ❤️ Love Space Rooms ({filteredRooms.length})
                        </TabsTrigger>
                        <TabsTrigger 
                            value="greetings"
                            className="flex-1 md:flex-initial rounded-xl px-6 py-3 text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                        >
                            🎁 Wishes Websites ({filteredGreetings.length})
                        </TabsTrigger>
                        <TabsTrigger 
                            value="gmail-inspector"
                            className="flex-1 md:flex-initial rounded-xl px-6 py-3 text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                        >
                            📧 Gmail & Gallery Inspector
                        </TabsTrigger>
                        <TabsTrigger 
                            value="r2-images"
                            className="flex-1 md:flex-initial rounded-xl px-6 py-3 text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                        >
                            📷 R2 Bucket Images ({filteredR2Images.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Rooms Tab */}
                    <TabsContent value="rooms" className="space-y-4">
                        {/* Search Bar */}
                        <div className="relative max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                            <Input
                                value={roomSearch}
                                onChange={(e) => setRoomSearch(e.target.value)}
                                placeholder="Search rooms by nickname or room code..."
                                className="pl-11 bg-slate-900/30 border-slate-800 text-slate-100 rounded-xl focus:border-pink-500 focus:ring-pink-500/20"
                            />
                        </div>

                        {/* Rooms List */}
                        <div className="space-y-4">
                            {filteredRooms.length === 0 ? (
                                <div className="text-center py-16 bg-slate-900/20 rounded-[2rem] border border-slate-900">
                                    <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                    <h3 className="font-bold text-lg text-slate-400">No rooms found</h3>
                                    <p className="text-slate-500 text-sm mt-1">Try modifying your search filter.</p>
                                </div>
                            ) : (
                                filteredRooms.slice(0, visibleRoomsCount).map(room => {
                                    const roomMembers = roomMembersMap.get(room.id) || [];
                                    const roomMessages = roomMessagesMap.get(room.id) || [];
                                    const isExpanded = activeRoomId === room.id;
                                    
                                    const nicknamesLabel = roomMembers.length > 0 
                                        ? roomMembers.map(m => m.nickname).join(' & ') 
                                        : 'Empty Room';
                                    
                                    const roomUrl = `${window.location.origin}/love-space/${room.id}`;

                                    return (
                                        <Card 
                                            key={room.id}
                                            className={`bg-slate-900/20 border-slate-900/80 hover:border-pink-500/20 transition-all rounded-2xl overflow-hidden ${isExpanded ? 'border-pink-500/30 bg-slate-900/30 shadow-lg' : ''}`}
                                        >
                                            {/* Room Header Row */}
                                            <div 
                                                onClick={() => setActiveRoomId(isExpanded ? null : room.id)}
                                                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center flex-shrink-0 text-pink-400 font-bold">
                                                        ❤️
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="font-bold text-white text-base">
                                                            {nicknamesLabel}
                                                        </h3>
                                                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                                            <span>Code: <strong className="text-slate-200">{room.room_code}</strong></span>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3.5 h-3.5" />
                                                                {new Date(room.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 self-end sm:self-center">
                                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                                                        room.is_active 
                                                            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                                            : 'bg-slate-500/10 text-slate-400 border-slate-800'
                                                    }`}>
                                                        {room.is_active ? 'Active' : 'Closed/Expired'}
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">
                                                        {roomMessages.length} msgs
                                                    </span>
                                                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                                </div>
                                            </div>

                                            {/* Expanded Chat Log Drawer */}
                                            {isExpanded && (
                                                <div className="border-t border-slate-900 bg-slate-950/60 p-6 space-y-6">
                                                    {/* Action Bar */}
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/40 rounded-xl p-3 border border-slate-900 text-xs">
                                                        <div className="flex items-center gap-2 text-slate-400 font-semibold">
                                                            <span>Room ID:</span>
                                                            <code className="text-pink-400 font-bold bg-slate-950/80 px-2 py-1 rounded select-all">{room.id}</code>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => copyText(roomUrl, 'Room URL')}
                                                                className="h-8 bg-slate-950 border-slate-800 text-[11px] font-bold text-slate-300 flex items-center gap-1.5 rounded-lg"
                                                            >
                                                                <Copy className="w-3.5 h-3.5" />
                                                                Copy URL
                                                            </Button>
                                                            <a 
                                                                href={roomUrl} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="h-8 bg-pink-500 hover:bg-pink-600 text-[11px] font-bold text-white flex items-center gap-1.5 rounded-lg px-3 py-1 text-center shadow-md transition-all"
                                                            >
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                                Visit Room
                                                            </a>
                                                        </div>
                                                    </div>

                                                    {/* Message Logs */}
                                                    <div className="space-y-4">
                                                        <h4 className="text-sm font-bold text-pink-400 uppercase tracking-widest px-1">💬 Message Logs</h4>
                                                        
                                                        {roomMessages.length === 0 ? (
                                                            <div className="text-center py-10 bg-slate-900/10 rounded-xl border border-slate-900/50">
                                                                <MessageSquareHeart className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                                                                <p className="text-xs text-slate-500 font-semibold">No messages exchanged yet in this room.</p>
                                                            </div>
                                                        ) : (
                                                            <div className="max-h-[350px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                                                                {roomMessages.map((msg) => {
                                                                    const memberIndex = roomMembers.findIndex(m => m.nickname === msg.sender_nickname);
                                                                    const isEven = memberIndex % 2 === 0;

                                                                    return (
                                                                        <div 
                                                                            key={msg.id}
                                                                            className="flex flex-col space-y-1 bg-slate-900/20 border border-slate-900/60 rounded-xl p-3"
                                                                        >
                                                                            <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold">
                                                                                <span className={`font-bold ${isEven ? 'text-pink-400' : 'text-purple-400'}`}>
                                                                                    {msg.sender_nickname}
                                                                                </span>
                                                                                <span>
                                                                                    {new Date(msg.created_at).toLocaleString()}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-sm text-slate-200 mt-1 whitespace-pre-wrap break-words leading-relaxed font-medium">
                                                                                {msg.message}
                                                                            </p>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </Card>
                                    );
                                })
                            )}
                            {filteredRooms.length > visibleRoomsCount && (
                                <div className="flex justify-center pt-6">
                                    <Button
                                        onClick={() => setVisibleRoomsCount(prev => prev + 50)}
                                        className="bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold py-5 px-8 rounded-xl shadow-lg shadow-pink-500/10 transition-all active:scale-95 text-xs uppercase tracking-wider"
                                    >
                                        Load More Rooms ({filteredRooms.length - visibleRoomsCount} remaining)
                                    </Button>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Greetings Tab */}
                    <TabsContent value="greetings" className="space-y-4">
                        {/* Search and Selection Toolbar */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-900">
                            <div className="relative w-full sm:max-w-md">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                                <Input
                                    value={greetingSearch}
                                    onChange={(e) => setGreetingSearch(e.target.value)}
                                    placeholder="Search greetings by sender, recipient, occasion, or Gmail..."
                                    className="pl-11 bg-slate-900/60 border-slate-800 text-slate-100 rounded-xl focus:border-indigo-500 focus:ring-indigo-500/20"
                                />
                            </div>

                            {/* Batch Selection Controls */}
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleSelectAllWishes(filteredGreetings)}
                                    className="bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2"
                                >
                                    {filteredGreetings.length > 0 && filteredGreetings.every(g => selectedWishIds.has(g.id)) ? (
                                        <>
                                            <CheckSquare className="w-4 h-4 text-indigo-400" />
                                            Deselect All
                                        </>
                                    ) : (
                                        <>
                                            <Square className="w-4 h-4 text-slate-500" />
                                            Select All ({filteredGreetings.length})
                                        </>
                                    )}
                                </Button>

                                {selectedWishIds.size > 0 && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setWishIdsToDelete(Array.from(selectedWishIds))}
                                        className="bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-rose-500/20 animate-pulse"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Selected ({selectedWishIds.size})
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Greetings List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredGreetings.length === 0 ? (
                                <div className="col-span-full text-center py-16 bg-slate-900/20 rounded-[2rem] border border-slate-900">
                                    <Gift className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                    <h3 className="font-bold text-lg text-slate-400">No greetings found</h3>
                                    <p className="text-slate-500 text-sm mt-1">Try modifying your search filter.</p>
                                </div>
                            ) : (
                                filteredGreetings.slice(0, visibleGreetingsCount).map(g => {
                                    const isExpanded = activeGreetingId === g.id;
                                    const isSelected = selectedWishIds.has(g.id);
                                    const greetingUrl = `${window.location.origin}/digital-greeting/${g.slug}`;
                                    const userEmail = profiles.find(p => p.id === g.user_id)?.email || null;

                                    return (
                                        <Card 
                                            key={g.id}
                                            className={`bg-slate-900/20 border-slate-900/80 hover:border-indigo-500/20 transition-all rounded-2xl overflow-hidden relative ${
                                                isSelected ? 'border-indigo-500/60 bg-indigo-950/20 shadow-lg' : isExpanded ? 'border-indigo-500/30 bg-slate-900/30 shadow-lg' : ''
                                            }`}
                                        >
                                            <div className="p-5 flex flex-col justify-between h-full gap-4">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex items-center gap-3">
                                                        {/* Checkbox for batch select */}
                                                        <div 
                                                            onClick={(e) => { e.stopPropagation(); toggleSelectWish(g.id); }}
                                                            className="flex items-center justify-center p-1 cursor-pointer"
                                                        >
                                                            <Checkbox
                                                                checked={isSelected}
                                                                onCheckedChange={() => toggleSelectWish(g.id)}
                                                                className="border-indigo-500/50 data-[state=checked]:bg-indigo-500 data-[state=checked]:text-white w-5 h-5 rounded-md"
                                                            />
                                                        </div>

                                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 text-xl">
                                                            {g.sender_avatar || '🎁'}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-white text-base">
                                                                {g.sender_name} ➔ {g.recipient_name}
                                                            </h3>
                                                            <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                                                Relationship: <strong className="text-slate-300 font-bold">{g.relationship}</strong>
                                                            </p>
                                                            <div className="flex items-center gap-1.5 mt-1">
                                                                <span className="text-xs text-slate-400 font-semibold">Account Gmail:</span>
                                                                {userEmail ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => inspectGmail(userEmail)}
                                                                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full"
                                                                        title="Inspect this Gmail gallery & wishes"
                                                                    >
                                                                        <Mail className="w-3 h-3" />
                                                                        {userEmail}
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-xs text-slate-500 italic">Anonymous / Guest</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Individual Delete Button */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setWishIdsToDelete([g.id])}
                                                        className="h-8 w-8 text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg flex-shrink-0 transition-colors"
                                                        title="Delete this wish"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                                                    <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                                                        {g.occasion}
                                                    </span>
                                                    <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">
                                                        Theme: {g.theme}
                                                    </span>
                                                    <span className="bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-full ml-auto">
                                                        {new Date(g.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                <div className="border-t border-slate-900/80 pt-4 flex items-center justify-between gap-3">
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => setActiveGreetingId(isExpanded ? null : g.id)}
                                                        className="text-xs font-bold text-slate-400 hover:text-slate-200 p-0 h-auto flex items-center gap-1"
                                                    >
                                                        {isExpanded ? 'Hide Details' : 'View Message Details'}
                                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    </Button>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => copyText(greetingUrl, 'Wishes Website URL')}
                                                            className="h-8 w-8 bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg flex items-center justify-center"
                                                            title="Copy Link"
                                                        >
                                                            <Copy className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <a 
                                                            href={greetingUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="h-8 bg-indigo-600 hover:bg-indigo-700 text-[11px] font-bold text-white flex items-center gap-1.5 rounded-lg px-3 py-1 text-center shadow-md transition-all"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                            Open Link
                                                        </a>
                                                    </div>
                                                </div>

                                                {/* Expanded Details */}
                                                {isExpanded && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        transition={{ duration: 0.2 }}
                                                        className="border-t border-slate-900 bg-slate-950/40 rounded-xl p-4 mt-2 space-y-4 text-xs overflow-hidden"
                                                    >
                                                        <div className="space-y-1">
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Custom Message:</span>
                                                            <p className="text-slate-300 font-medium leading-relaxed bg-slate-900/30 border border-slate-900/60 p-3 rounded-lg whitespace-pre-wrap">
                                                                {g.message}
                                                            </p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4 text-[11px] font-medium text-slate-400 border-b border-slate-900 pb-4">
                                                            <div>
                                                                <span className="text-[9px] font-bold text-slate-500 uppercase block">Reveal Type:</span>
                                                                <span className="text-slate-200 bg-slate-900 px-2 py-0.5 rounded font-bold">{g.reveal_type}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-[9px] font-bold text-slate-500 uppercase block">Music Selection:</span>
                                                                <span className="text-slate-200 bg-slate-900 px-2 py-0.5 rounded font-bold">{g.music_id}</span>
                                                            </div>
                                                            {g.photo_url && (
                                                                <div className="col-span-2">
                                                                    <span className="text-[9px] font-bold text-slate-500 uppercase block">Custom Photo URL:</span>
                                                                    <a 
                                                                        href={g.photo_url} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer" 
                                                                        className="text-indigo-400 hover:underline font-bold truncate block"
                                                                    >
                                                                        {g.photo_url}
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* User Gallery Images */}
                                                        {(() => {
                                                            const userImages = gallery.filter(img => img.user_id === g.user_id);
                                                            if (userImages.length > 0) {
                                                                return (
                                                                    <div className="space-y-2 pt-2">
                                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                                                                            User Gallery ({userImages.length} images):
                                                                        </span>
                                                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 bg-slate-900/30 border border-slate-900/60 p-3 rounded-lg">
                                                                            {userImages.map((img) => (
                                                                                <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-slate-800 group/img">
                                                                                    <img 
                                                                                        src={img.image_url} 
                                                                                        alt="Gallery" 
                                                                                        className="object-cover w-full h-full hover:scale-110 transition-transform duration-200"
                                                                                    />
                                                                                    <a 
                                                                                        href={img.image_url} 
                                                                                        target="_blank" 
                                                                                        rel="noopener noreferrer"
                                                                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity"
                                                                                    >
                                                                                        <ExternalLink className="w-4 h-4 text-white" />
                                                                                    </a>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            } else if (g.user_id) {
                                                                return (
                                                                    <div className="space-y-2 pt-2">
                                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                                                                            User Gallery:
                                                                        </span>
                                                                        <p className="text-slate-500 italic bg-slate-900/30 border border-slate-900/60 p-2.5 rounded-lg">
                                                                            No images uploaded to this user's gallery yet.
                                                                        </p>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </motion.div>
                                                )}
                                            </div>
                                        </Card>
                                    );
                                })
                            )}
                            {filteredGreetings.length > visibleGreetingsCount && (
                                <div className="col-span-full flex justify-center pt-6">
                                    <Button
                                        onClick={() => setVisibleGreetingsCount(prev => prev + 50)}
                                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-5 px-8 rounded-xl shadow-lg shadow-indigo-500/10 transition-all active:scale-95 text-xs uppercase tracking-wider"
                                    >
                                        Load More Greetings ({filteredGreetings.length - visibleGreetingsCount} remaining)
                                    </Button>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Gmail & Gallery Inspector Tab */}
                    <TabsContent value="gmail-inspector" className="space-y-6">
                        {/* Search Card */}
                        <Card className="bg-slate-900/40 border-slate-900 rounded-[1.5rem] p-6 space-y-5">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Mail className="w-5 h-5 text-rose-500" />
                                        Gmail & User Gallery Inspector
                                    </h3>
                                    <p className="text-slate-400 text-xs mt-1">
                                        Enter a user Gmail address to view their gallery pictures, wishes, and delete wishes.
                                    </p>
                                </div>
                                {allKnownGmails.length > 0 && (
                                    <span className="text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                                        {allKnownGmails.length} Registered Gmails
                                    </span>
                                )}
                            </div>

                            {/* Gmail Input & Suggestions */}
                            <div className="space-y-3 max-w-2xl">
                                <form 
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (gmailSearchInput.trim()) {
                                            setActiveInspectorGmail(gmailSearchInput.trim());
                                        }
                                    }}
                                    className="flex flex-col sm:flex-row gap-3"
                                >
                                    <div className="relative flex-1">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                                        <Input
                                            type="email"
                                            list="gmail-suggestions"
                                            value={gmailSearchInput}
                                            onChange={(e) => setGmailSearchInput(e.target.value)}
                                            placeholder="Enter user Gmail (e.g. user@gmail.com)..."
                                            className="pl-11 bg-slate-950/60 border-slate-800 text-slate-100 rounded-xl focus:border-rose-500 focus:ring-rose-500/20 text-sm"
                                        />
                                        <datalist id="gmail-suggestions">
                                            {allKnownGmails.map(email => (
                                                <option key={email} value={email} />
                                            ))}
                                        </datalist>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold rounded-xl px-6 py-2.5 text-sm shadow-md transition-all flex items-center gap-2"
                                    >
                                        <Search className="w-4 h-4" />
                                        Inspect Gmail
                                    </Button>
                                </form>

                                {/* Quick Email Badges */}
                                {allKnownGmails.length > 0 && (
                                    <div className="space-y-1.5 pt-1">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Known User Gmails:</span>
                                        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
                                            {allKnownGmails.map(email => (
                                                <button
                                                    key={email}
                                                    type="button"
                                                    onClick={() => inspectGmail(email)}
                                                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${
                                                        activeInspectorGmail.toLowerCase() === email.toLowerCase()
                                                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm'
                                                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                                                    }`}
                                                >
                                                    {email}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Inspected User View */}
                        {!activeInspectorGmail.trim() ? (
                            <div className="text-center py-16 bg-slate-900/20 rounded-[2rem] border border-slate-900 space-y-3">
                                <Mail className="w-12 h-12 text-slate-600 mx-auto" />
                                <h3 className="font-bold text-lg text-slate-400">No Gmail inspected yet</h3>
                                <p className="text-slate-500 text-sm max-w-md mx-auto">
                                    Type a Gmail address above or click any known user Gmail badge to inspect their gallery photos and wishes.
                                </p>
                            </div>
                        ) : !inspectedUserData ? (
                            <div className="text-center py-16 bg-slate-900/20 rounded-[2rem] border border-slate-900">
                                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                                <h3 className="font-bold text-lg text-slate-300">No records found for "{activeInspectorGmail}"</h3>
                                <p className="text-slate-500 text-sm mt-1">Make sure the Gmail address is spelled correctly.</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Summary Header Banner */}
                                <div className="bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-slate-900/40 border border-rose-500/20 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                                                Inspecting User
                                            </span>
                                            <h2 className="text-2xl font-extrabold text-white">{inspectedUserData.email}</h2>
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium">
                                            User ID: <code className="text-slate-300 font-bold bg-slate-900 px-2 py-0.5 rounded">{inspectedUserData.userId || 'Guest / Unregistered'}</code>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-bold">
                                        <div className="bg-slate-900/80 border border-slate-800 px-4 py-2.5 rounded-xl text-center">
                                            <span className="text-slate-400 block text-[10px] uppercase">Gallery Photos</span>
                                            <span className="text-xl font-extrabold text-pink-400">{inspectedUserData.galleryPictures.length}</span>
                                        </div>
                                        <div className="bg-slate-900/80 border border-slate-800 px-4 py-2.5 rounded-xl text-center">
                                            <span className="text-slate-400 block text-[10px] uppercase">Total Wishes</span>
                                            <span className="text-xl font-extrabold text-indigo-400">{inspectedUserData.userWishes.length}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 1: Gallery Pictures */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                                            <ImageIcon className="w-5 h-5 text-pink-500" />
                                            Gallery Pictures ({inspectedUserData.galleryPictures.length})
                                        </h3>
                                    </div>

                                    {inspectedUserData.galleryPictures.length === 0 ? (
                                        <div className="text-center py-12 bg-slate-900/20 rounded-2xl border border-slate-900">
                                            <ImageIcon className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                                            <p className="text-sm text-slate-500 font-semibold">No gallery pictures found for this Gmail.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                            {inspectedUserData.galleryPictures.map((pic) => (
                                                <Card 
                                                    key={pic.id}
                                                    className="bg-slate-900/30 border-slate-900 rounded-xl overflow-hidden group hover:border-pink-500/30 transition-all"
                                                >
                                                    <div className="relative aspect-square w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                                                        <img 
                                                            src={pic.url} 
                                                            alt="Gallery"
                                                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                                                            loading="lazy"
                                                        />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                                                            <Button
                                                                variant="secondary"
                                                                size="icon"
                                                                onClick={() => copyText(pic.url, 'Picture URL')}
                                                                className="h-8 w-8 bg-slate-900 text-white rounded-lg"
                                                                title="Copy URL"
                                                            >
                                                                <Copy className="w-3.5 h-3.5" />
                                                            </Button>
                                                            <a 
                                                                href={pic.url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="h-8 w-8 bg-pink-500 text-white rounded-lg flex items-center justify-center shadow-md"
                                                                title="Open original"
                                                            >
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                    <div className="p-2.5 text-[10px] text-slate-400 font-semibold flex justify-between items-center bg-slate-950/60 border-t border-slate-900">
                                                        <span className="truncate max-w-[80px]" title={pic.source}>{pic.source}</span>
                                                        <span>{pic.created_at ? new Date(pic.created_at).toLocaleDateString() : ''}</span>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Section 2: Wishes */}
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-900">
                                        <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                                            <Gift className="w-5 h-5 text-indigo-500" />
                                            Wishes Created ({inspectedUserData.userWishes.length})
                                        </h3>

                                        {/* Selection & Batch Delete Controls */}
                                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => toggleSelectAllWishes(inspectedUserData.userWishes)}
                                                className="bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2"
                                            >
                                                {inspectedUserData.userWishes.length > 0 && inspectedUserData.userWishes.every(w => selectedWishIds.has(w.id)) ? (
                                                    <>
                                                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                                                        Deselect All
                                                    </>
                                                ) : (
                                                    <>
                                                        <Square className="w-4 h-4 text-slate-500" />
                                                        Select All ({inspectedUserData.userWishes.length})
                                                    </>
                                                )}
                                            </Button>

                                            {inspectedUserData.userWishes.some(w => selectedWishIds.has(w.id)) && (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        const userSelectedIds = inspectedUserData.userWishes.map(w => w.id).filter(id => selectedWishIds.has(id));
                                                        setWishIdsToDelete(userSelectedIds);
                                                    }}
                                                    className="bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-rose-500/20"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete Selected Wishes
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {inspectedUserData.userWishes.length === 0 ? (
                                        <div className="text-center py-12 bg-slate-900/20 rounded-2xl border border-slate-900">
                                            <Gift className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                                            <p className="text-sm text-slate-500 font-semibold">No wishes websites created by this Gmail user yet.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {inspectedUserData.userWishes.map((w) => {
                                                const isSelected = selectedWishIds.has(w.id);
                                                const greetingUrl = `${window.location.origin}/digital-greeting/${w.slug}`;

                                                return (
                                                    <Card 
                                                        key={w.id}
                                                        className={`bg-slate-900/20 border-slate-900/80 hover:border-indigo-500/30 transition-all rounded-2xl overflow-hidden p-5 flex flex-col justify-between gap-4 ${
                                                            isSelected ? 'border-indigo-500/60 bg-indigo-950/20 shadow-lg' : ''
                                                        }`}
                                                    >
                                                        <div className="flex justify-between items-start gap-3">
                                                            <div className="flex items-center gap-3">
                                                                <div 
                                                                    onClick={() => toggleSelectWish(w.id)}
                                                                    className="cursor-pointer p-1"
                                                                >
                                                                    <Checkbox
                                                                        checked={isSelected}
                                                                        onCheckedChange={() => toggleSelectWish(w.id)}
                                                                        className="border-indigo-500/50 data-[state=checked]:bg-indigo-500 data-[state=checked]:text-white w-5 h-5 rounded-md"
                                                                    />
                                                                </div>
                                                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 text-xl">
                                                                    {w.sender_avatar || '🎁'}
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-white text-base">
                                                                        {w.sender_name} ➔ {w.recipient_name}
                                                                    </h4>
                                                                    <p className="text-xs text-slate-400 font-medium">
                                                                        Occasion: <strong className="text-slate-200 font-semibold">{w.occasion}</strong>
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setWishIdsToDelete([w.id])}
                                                                className="h-8 w-8 text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg flex-shrink-0"
                                                                title="Delete this wish"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>

                                                        <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3 text-xs text-slate-300 font-medium leading-relaxed max-h-24 overflow-y-auto whitespace-pre-wrap">
                                                            {w.message}
                                                        </div>

                                                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900 text-xs text-slate-400">
                                                            <span className="text-[10px] font-bold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">
                                                                Theme: {w.theme}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={() => copyText(greetingUrl, 'Wishes Website URL')}
                                                                    className="h-7 w-7 bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 rounded-md"
                                                                    title="Copy Link"
                                                                >
                                                                    <Copy className="w-3.5 h-3.5" />
                                                                </Button>
                                                                <a 
                                                                    href={greetingUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="h-7 bg-indigo-600 hover:bg-indigo-700 text-[11px] font-bold text-white flex items-center gap-1 rounded-md px-2.5 py-0.5 transition-all shadow-sm"
                                                                >
                                                                    <ExternalLink className="w-3 h-3" />
                                                                    Visit
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    {/* R2 Images Tab */}
                    <TabsContent value="r2-images" className="space-y-6">
                        {/* Search and Summary */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                            <div className="relative w-full max-w-md">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                                <Input
                                    value={r2Search}
                                    onChange={(e) => setR2Search(e.target.value)}
                                    placeholder="Search by key, user ID, or email..."
                                    className="pl-11 bg-slate-900/30 border-slate-800 text-slate-100 rounded-xl focus:border-pink-500 focus:ring-pink-500/20"
                                />
                            </div>
                            <div className="text-xs text-slate-400 font-bold bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl flex items-center gap-2 self-stretch sm:self-auto justify-center">
                                <ImageIcon className="w-4 h-4 text-pink-500" />
                                <span>Loaded: {r2Images.length} | Size: {formatBytes(totalR2SizeLoaded)}</span>
                            </div>
                        </div>

                        {/* Error state */}
                        {r2Error && (
                            <div className="flex items-center gap-2 text-sm font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 max-w-md mx-auto my-6">
                                <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                                <span>{r2Error}</span>
                            </div>
                        )}

                        {/* Loading state */}
                        {isR2Loading && r2Images.length === 0 ? (
                            <div className="text-center py-16">
                                <Loader2 className="w-10 h-10 animate-spin text-pink-500 mx-auto mb-4" />
                                <p className="text-slate-400 text-sm font-medium">Fetching images from Cloudflare R2 bucket...</p>
                            </div>
                        ) : (
                            <>
                                {/* R2 Images Grid */}
                                {filteredR2Images.length === 0 ? (
                                    <div className="text-center py-16 bg-slate-900/20 rounded-[2rem] border border-slate-900">
                                        <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                        <h3 className="font-bold text-lg text-slate-400">No R2 images found</h3>
                                        <p className="text-slate-500 text-sm mt-1">Try modifying your search filter.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {filteredR2Images.map((img) => (
                                            <Card 
                                                key={img.key} 
                                                className="bg-slate-900/20 border-slate-900/85 rounded-2xl overflow-hidden hover:border-pink-500/25 transition-all flex flex-col group"
                                            >
                                                {/* Image Preview */}
                                                <div className="relative aspect-square w-full bg-slate-950/80 flex items-center justify-center overflow-hidden border-b border-slate-900">
                                                    <img 
                                                        src={img.url} 
                                                        alt={img.key}
                                                        className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3">
                                                        <Button
                                                            variant="secondary"
                                                            size="icon"
                                                            onClick={() => copyText(img.url, 'Image URL')}
                                                            className="bg-slate-900/90 hover:bg-slate-950 text-white rounded-lg w-8 h-8 flex-shrink-0"
                                                            title="Copy Image URL"
                                                        >
                                                            <Copy className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <a 
                                                            href={img.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-lg w-8 h-8 flex items-center justify-center flex-shrink-0 shadow-md"
                                                            title="Open original image in new tab"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                    </div>
                                                </div>

                                                {/* Card Details */}
                                                <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                                                    <div className="space-y-1.5">
                                                        <div className="flex justify-between items-start gap-2">
                                                            {img.email ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => inspectGmail(img.email!)}
                                                                    className="text-[10px] font-bold text-pink-400 uppercase tracking-wider bg-pink-500/10 border border-pink-500/20 px-2.5 py-1 rounded-full truncate max-w-[70%] hover:underline"
                                                                    title="Inspect Gmail Gallery"
                                                                >
                                                                    👤 {img.email}
                                                                </button>
                                                            ) : (
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                                                                    Direct Upload
                                                                </span>
                                                            )}
                                                            <span className="text-[10px] text-slate-400 font-bold bg-slate-900/60 px-2 py-0.5 rounded border border-slate-900 whitespace-nowrap">
                                                                {formatBytes(img.size)}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-200 font-medium break-all line-clamp-2" title={img.key}>
                                                            {img.key.replace(/^wishes\/[^/]+\//, '')}
                                                        </p>
                                                    </div>

                                                    <div className="pt-2.5 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500 font-semibold">
                                                        <span className="truncate max-w-[125px]" title={`User ID: ${img.userId || 'None'}`}>
                                                            ID: {img.userId ? img.userId.slice(0, 8) + '...' : 'N/A'}
                                                        </span>
                                                        <span>
                                                            {img.lastModified ? new Date(img.lastModified).toLocaleDateString() : 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}

                                {/* Paginated load more button */}
                                {r2ContinuationToken && (
                                    <div className="flex justify-center pt-6">
                                        <Button
                                            onClick={() => loadR2Images(r2ContinuationToken)}
                                            disabled={isR2Loading}
                                            className="bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold py-5 px-8 rounded-xl shadow-lg shadow-pink-500/10 transition-all active:scale-95 text-xs uppercase tracking-wider flex items-center gap-2"
                                        >
                                            {isR2Loading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Loading More...
                                                </>
                                            ) : (
                                                <>
                                                    Load More Images
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Delete Wishes Confirmation Dialog */}
            <Dialog open={!!wishIdsToDelete} onOpenChange={(open) => { if (!open) setWishIdsToDelete(null); }}>
                <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 rounded-2xl max-w-md p-6">
                    <DialogHeader className="space-y-2">
                        <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center text-rose-400 mx-auto sm:mx-0">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-white">
                            Confirm Delete {wishIdsToDelete?.length || 0} Wish(es)?
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 text-sm">
                            Are you sure you want to permanently delete {wishIdsToDelete?.length === 1 ? 'this wish website' : `these ${wishIdsToDelete?.length} wish websites`}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setWishIdsToDelete(null)}
                            disabled={isDeletingWishes}
                            className="bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800 rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (wishIdsToDelete) handleDeleteWishes(wishIdsToDelete);
                            }}
                            disabled={isDeletingWishes}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-2"
                        >
                            {isDeletingWishes ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    Delete Permanently
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Box,
  Avatar,
  Divider,
  Collapse,
  IconButton,
} from '@mui/material';
import { MessageSquare, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { getTeam, getForumPosts, saveForumPost, updateForumPost } from '../utils/storage';
import type { ForumPost, ForumReply } from '../types';

export function Forum() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});

  const team = getTeam();

  useEffect(() => {
    const allPosts = getForumPosts();
    setPosts(allPosts.sort((a, b) => b.timestamp - a.timestamp));
  }, []);

  const handleCreatePost = () => {
    if (!team || !newPostContent.trim()) return;

    const post: ForumPost = {
      id: Date.now().toString(),
      teamName: team.name,
      teamDiscriminator: team.discriminator,
      content: newPostContent,
      timestamp: Date.now(),
      replies: [],
    };

    saveForumPost(post);
    setPosts([post, ...posts]);
    setNewPostContent('');
  };

  const handleReply = (postId: string) => {
    if (!team || !replyContent[postId]?.trim()) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const reply: ForumReply = {
      id: Date.now().toString(),
      teamName: team.name,
      teamDiscriminator: team.discriminator,
      content: replyContent[postId],
      timestamp: Date.now(),
    };

    post.replies.push(reply);
    updateForumPost(post);

    setPosts(posts.map(p => p.id === postId ? post : p));
    setReplyContent({ ...replyContent, [postId]: '' });
  };

  const toggleExpand = (postId: string) => {
    setExpandedPosts({
      ...expandedPosts,
      [postId]: !expandedPosts[postId],
    });
  };

  if (!team) return null;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Team Forum
      </Typography>

      <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'white' }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Avatar sx={{ bgcolor: 'white', color: 'primary.main' }}>
              {team.name.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Ask a question or share an idea..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                variant="outlined"
                sx={{
                  bgcolor: 'white',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { border: 'none' },
                  },
                }}
              />
              <Button
                variant="contained"
                endIcon={<Send size={18} />}
                onClick={handleCreatePost}
                disabled={!newPostContent.trim()}
                sx={{
                  mt: 1,
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                }}
              >
                Post
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {posts.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
            <Typography variant="h6" color="text.secondary">
              No posts yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Be the first to start a discussion!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {posts.map((post) => (
            <Card key={post.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {post.teamName.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="subtitle1">
                          {post.teamName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(post.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>
                      {post.content}
                    </Typography>

                    {post.replies.length > 0 && (
                      <Button
                        size="small"
                        endIcon={expandedPosts[post.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        onClick={() => toggleExpand(post.id)}
                      >
                        {post.replies.length} {post.replies.length === 1 ? 'Reply' : 'Replies'}
                      </Button>
                    )}

                    <Collapse in={expandedPosts[post.id]}>
                      <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
                        {post.replies.map((reply) => (
                          <Box key={reply.id} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
                              <Avatar sx={{ width: 24, height: 24, fontSize: '0.875rem' }}>
                                {reply.teamName.charAt(0)}
                              </Avatar>
                              <Typography variant="body2">
                                {reply.teamName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                • {new Date(reply.timestamp).toLocaleString()}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ pl: 4 }}>
                              {reply.content}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Collapse>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Write a reply..."
                        value={replyContent[post.id] || ''}
                        onChange={(e) =>
                          setReplyContent({ ...replyContent, [post.id]: e.target.value })
                        }
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleReply(post.id);
                          }
                        }}
                      />
                      <IconButton
                        color="primary"
                        onClick={() => handleReply(post.id)}
                        disabled={!replyContent[post.id]?.trim()}
                      >
                        <Send size={20} />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </div>
  );
}

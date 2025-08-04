import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Star, CheckCircle, XCircle, Flag, Eye, MessageSquare, Shield, Clock } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  verified_purchase: boolean;
  helpful_count: number;
  total_votes: number;
  moderation_status: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderation_notes: string;
  user_id: string;
  created_at: string;
  products: {
    name: string;
  };
  profiles: {
    first_name: string;
    last_name: string;
  };
}

export default function ReviewManagement() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('pending');
  const [moderationDialog, setModerationDialog] = useState<{
    open: boolean;
    review: Review | null;
    action: 'approve' | 'reject' | 'flag' | null;
  }>({
    open: false,
    review: null,
    action: null
  });
  const [moderationNotes, setModerationNotes] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [selectedTab]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('reviews')
        .select(`
          *,
          products:product_id (name),
          profiles:user_id (first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (selectedTab !== 'all') {
        query = query.eq('moderation_status', selectedTab);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform the data to handle potential null profiles
      const transformedReviews = (data || []).map(review => ({
        ...review,
        images: Array.isArray(review.images) ? review.images.filter((img): img is string => typeof img === 'string') : [],
        moderation_status: (review.moderation_status as 'pending' | 'approved' | 'rejected' | 'flagged') || 'pending',
        products: review.products && !('error' in review.products) ? review.products : { name: 'Unknown Product' },
        profiles: review.profiles && !('error' in review.profiles) ? review.profiles : { first_name: 'Unknown', last_name: 'User' }
      }));
      
      setReviews(transformedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reviews",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModerationAction = async () => {
    if (!moderationDialog.review || !moderationDialog.action) return;

    try {
      const newStatus = moderationDialog.action === 'approve' ? 'approved' : 
                       moderationDialog.action === 'reject' ? 'rejected' : 'flagged';

      const { error } = await supabase
        .from('reviews')
        .update({
          moderation_status: newStatus,
          moderation_notes: moderationNotes || null
        })
        .eq('id', moderationDialog.review.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Review ${moderationDialog.action}d successfully`
      });

      setModerationDialog({ open: false, review: null, action: null });
      setModerationNotes('');
      fetchReviews();
    } catch (error) {
      console.error('Error updating review:', error);
      toast({
        title: "Error",
        description: "Failed to update review",
        variant: "destructive"
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'flagged': return 'bg-orange-100 text-orange-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'flagged': return <Flag className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return null;
    }
  };

  const openModerationDialog = (review: Review, action: 'approve' | 'reject' | 'flag') => {
    setModerationDialog({ open: true, review, action });
    setModerationNotes(review.moderation_notes || '');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  const reviewCounts = {
    pending: reviews.filter(r => r.moderation_status === 'pending').length,
    approved: reviews.filter(r => r.moderation_status === 'approved').length,
    rejected: reviews.filter(r => r.moderation_status === 'rejected').length,
    flagged: reviews.filter(r => r.moderation_status === 'flagged').length,
    all: reviews.length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Review Management</h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {reviewCounts.all} Total Reviews
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {reviewCounts.pending} Pending
          </Badge>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({reviewCounts.pending})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved ({reviewCounts.approved})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rejected ({reviewCounts.rejected})
          </TabsTrigger>
          <TabsTrigger value="flagged" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Flagged ({reviewCounts.flagged})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Reviews ({reviewCounts.all})
          </TabsTrigger>
        </TabsList>

        {['pending', 'approved', 'rejected', 'flagged', 'all'].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {reviews.length > 0 ? reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {review.profiles.first_name} {review.profiles.last_name}
                        </span>
                        {review.verified_purchase && (
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <div className="flex">{renderStars(review.rating)}</div>
                      <Badge className={`${getStatusColor(review.moderation_status)} flex items-center gap-1`}>
                        {getStatusIcon(review.moderation_status)}
                        {review.moderation_status.charAt(0).toUpperCase() + review.moderation_status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{review.products.name}</span>
                      <span>•</span>
                      <span>{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {review.title && (
                    <h4 className="font-medium">{review.title}</h4>
                  )}
                  
                  <p className="text-muted-foreground">{review.comment}</p>
                  
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {review.images.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`Review image ${index + 1}`}
                          className="w-20 h-20 object-cover rounded border cursor-pointer"
                          onClick={() => window.open(img, '_blank')}
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{review.helpful_count} helpful votes</span>
                      <span>{review.total_votes} total votes</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {review.moderation_status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => openModerationDialog(review, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openModerationDialog(review, 'reject')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openModerationDialog(review, 'flag')}
                          >
                            <Flag className="h-4 w-4 mr-1" />
                            Flag
                          </Button>
                        </>
                      )}
                      
                      {review.moderation_status !== 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openModerationDialog(review, 'approve')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {review.moderation_notes && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">Moderation Notes:</p>
                      <p className="text-sm text-muted-foreground">{review.moderation_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )) : (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No reviews found</p>
                <p className="text-sm">Reviews will appear here once submitted by customers</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Moderation Dialog */}
      <Dialog open={moderationDialog.open} onOpenChange={(open) => 
        setModerationDialog(prev => ({ ...prev, open }))
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {moderationDialog.action === 'approve' ? 'Approve Review' :
               moderationDialog.action === 'reject' ? 'Reject Review' : 'Flag Review'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {moderationDialog.review && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">{renderStars(moderationDialog.review.rating)}</div>
                  <span className="font-medium">
                    {moderationDialog.review.profiles.first_name} {moderationDialog.review.profiles.last_name}
                  </span>
                </div>
                {moderationDialog.review.title && (
                  <h4 className="font-medium mb-1">{moderationDialog.review.title}</h4>
                )}
                <p className="text-sm text-muted-foreground">{moderationDialog.review.comment}</p>
              </div>
            )}
            
            <div>
              <Label htmlFor="moderation-notes">
                Moderation Notes {moderationDialog.action === 'reject' ? '(Required)' : '(Optional)'}
              </Label>
              <Textarea
                id="moderation-notes"
                value={moderationNotes}
                onChange={(e) => setModerationNotes(e.target.value)}
                placeholder={
                  moderationDialog.action === 'approve' ? 'Optional notes about the approval...' :
                  moderationDialog.action === 'reject' ? 'Explain why this review is being rejected...' :
                  'Explain why this review needs attention...'
                }
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleModerationAction}
                disabled={moderationDialog.action === 'reject' && !moderationNotes.trim()}
                className={
                  moderationDialog.action === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  moderationDialog.action === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-orange-600 hover:bg-orange-700'
                }
              >
                {moderationDialog.action === 'approve' ? 'Approve Review' :
                 moderationDialog.action === 'reject' ? 'Reject Review' : 'Flag Review'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setModerationDialog({ open: false, review: null, action: null })}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
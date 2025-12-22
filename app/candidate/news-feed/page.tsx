"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Header, Card, StatusChip } from "@/components/system"
import { useDemoData } from "@/components/providers/demo-data-provider"
import { useLocalDb } from "@/components/providers/local-db-provider"
import { Button } from "@/components/ui/button"
import { ThumbsUp, Eye, Briefcase, ArrowRight, ExternalLink, ChevronDown, ChevronUp, MapPin, DollarSign, Clock, Sparkles, FileText, Award } from "lucide-react"
import { getJobById } from "@/lib/organization-local-db"
import { cn } from "@/lib/utils"
import type { NewsFeedPost } from "@/lib/local-db"

export default function NewsFeedPage() {
  const router = useRouter()
  const { candidate, allJobs } = useDemoData()
  const { data: localDb, togglePostLike } = useLocalDb()
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set())

  // Calculate profile completion
  const onboardingAnswers = localDb.onboardingDetails
  const hasBasicInfo = Boolean(onboardingAnswers.phoneNumber)
  const hasProfessionalInfo = Boolean(onboardingAnswers.occupation)
  
  const requiredDocs = useMemo(() => {
    const occupationCode = onboardingAnswers.occupation as string | undefined
    if (!occupationCode) {
      return []
    }
    try {
      const {
        getAdminWalletTemplatesByOccupation,
        getComplianceListItemById,
      } = require("@/lib/admin-local-db")
      const templates = getAdminWalletTemplatesByOccupation(occupationCode)
      const itemSet = new Set<string>()
      templates.forEach((template: any) => {
        template.listItemIds.forEach((listItemId: string) => {
          const listItem = getComplianceListItemById(listItemId)
          if (listItem && listItem.isActive) {
            itemSet.add(listItem.name)
          }
        })
      })
      return Array.from(itemSet)
    } catch (error) {
      return []
    }
  }, [onboardingAnswers.occupation])

  const uploadedDocSet = new Set(Object.keys(localDb.uploadedDocuments))
  const candidateDocSet = new Set(
    candidate.documents
      .filter((doc) => doc.status === "Completed" || doc.status === "Pending Verification")
      .map((doc) => doc.type)
  )
  
  const completedDocs = requiredDocs.filter((doc) => 
    uploadedDocSet.has(doc) || candidateDocSet.has(doc)
  ).length
  const totalDocs = requiredDocs.length

  const isProfileComplete = hasBasicInfo && 
                           hasProfessionalInfo && 
                           (totalDocs === 0 || (totalDocs > 0 && completedDocs === totalDocs))

  // Get all news feed posts
  const allPosts = useMemo(() => {
    const posts = Object.values(localDb.newsFeedPosts)
    // Sort by postedAt (newest first)
    return posts.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
  }, [localDb.newsFeedPosts])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else {
      return `${diffDays}d ago`
    }
  }

  const toggleExpand = (postId: string) => {
    setExpandedPosts((prev) => {
      const next = new Set(prev)
      if (next.has(postId)) {
        next.delete(postId)
      } else {
        next.add(postId)
      }
      return next
    })
  }

  const handleLike = (postId: string) => {
    togglePostLike(postId)
  }

  const handleViewShift = (jobId: string) => {
    router.push(`/candidate/jobs/${jobId}`)
  }

  const isPostLiked = (postId: string) => {
    return localDb.likedPosts.includes(postId)
  }

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "announcement":
        return <Sparkles className="h-4 w-4" />
      case "article":
        return <FileText className="h-4 w-4" />
      case "celebration":
        return <Award className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 p-8 max-w-4xl mx-auto">
      <Header
        title="News Feed"
        breadcrumbs={[
          { label: "Candidate Portal", href: "/candidate/dashboard" },
          { label: "News Feed" },
        ]}
      />

      {/* Profile Completion Banner */}
      {!isProfileComplete && (
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20 shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Complete your profile to unlock more job matches
              </h3>
              <p className="text-sm text-muted-foreground">
                Add your professional information and upload required documents to increase your visibility to employers.
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => router.push("/candidate/profile-setup")}
                className="whitespace-nowrap"
              >
                Complete Profile →
              </Button>
              <Button
                onClick={() => router.push("/candidate/documents")}
                className="whitespace-nowrap"
              >
                Upload Documents →
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Welcome Section */}
      <Card className="bg-gradient-to-br from-primary/5 via-transparent to-primary/5 border-primary/20">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Welcome back, {candidate.profile.name.split(" ")[0]}
          </h2>
          <p className="text-sm text-muted-foreground">
            Here's what's new for you today.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {!hasProfessionalInfo && (
            <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-5 hover:border-primary/50 hover:bg-primary/10 transition-all">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    Complete your profile to improve your matches
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Add your professional information to see more personalized job recommendations and content.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push("/candidate/profile-setup")}
                    className="w-full"
                  >
                    Complete Profile
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {totalDocs > 0 && completedDocs < totalDocs && (
            <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-5 hover:border-primary/50 hover:bg-primary/10 transition-all">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    Upload your {requiredDocs.find((doc) => !uploadedDocSet.has(doc) && !candidateDocSet.has(doc)) || "documents"} to be submission-ready
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Complete your Document Wallet to apply for jobs instantly.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push("/candidate/documents")}
                    className="w-full"
                  >
                    Upload Documents
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* News Feed Posts */}
      <div className="space-y-6">
        {allPosts.map((post) => {
          const isExpanded = expandedPosts.has(post.id)
          const isLiked = isPostLiked(post.id)
          const job = post.jobId ? (allJobs.find((j) => j.id === post.jobId) || getJobById(post.jobId)) : null
          const shouldShowExpand = post.content.length > 200 || (post.fullContent && post.fullContent.length > post.content.length)

          return (
            <Card key={post.id} className="hover:shadow-lg transition-all duration-300">
              {/* Post Header */}
              <div className="flex items-start gap-4 mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-sm font-bold text-primary-foreground flex-shrink-0 shadow-md">
                  {post.organizationInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">
                      {post.organizationName}
                    </p>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(post.postedAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {post.type === "recommended" && (
                      <StatusChip label="Recommended" tone="success" />
                    )}
                    {post.type === "announcement" && (
                      <StatusChip label="Announcement" tone="info" />
                    )}
                    {getPostTypeIcon(post.type) && (
                      <div className="text-muted-foreground">
                        {getPostTypeIcon(post.type)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-5">
                <h3 className="text-xl font-semibold text-foreground mb-3 leading-tight">
                  {post.title}
                </h3>
                <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {isExpanded && post.fullContent ? post.fullContent : post.content}
                </div>
                {shouldShowExpand && (
                  <button
                    onClick={() => toggleExpand(post.id)}
                    className="text-sm font-medium text-primary hover:text-primary/80 mt-3 flex items-center gap-1.5 transition-colors group"
                  >
                    {isExpanded ? (
                      <>
                        Show Less
                        <ChevronUp className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
                      </>
                    ) : (
                      <>
                        Show More
                        <ChevronDown className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Recommended Shift Card */}
              {post.type === "recommended" && job && (
                <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-5 mb-5 hover:border-primary/40 transition-all">
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      {job.title}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                        <DollarSign className="h-4 w-4 text-success" />
                        <span>{job.billRate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{job.shift}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleViewShift(post.jobId!)}
                    className="w-full group"
                  >
                    <Briefcase className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    View Shift
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              )}

              {/* Article Link */}
              {post.type === "article" && post.linkUrl && (
                <div className="mb-5">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (post.linkUrl === "#") {
                        alert("Article link would open here in production")
                      } else {
                        window.open(post.linkUrl, "_blank")
                      }
                    }}
                    className="group"
                  >
                    <ExternalLink className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    {post.linkLabel || "Read Full Article"}
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              )}

              {/* Program Link */}
              {post.type === "program" && post.linkUrl && (
                <div className="mb-5">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (post.linkUrl === "#") {
                        alert("Program details would open here in production")
                      } else {
                        window.open(post.linkUrl, "_blank")
                      }
                    }}
                    className="group"
                  >
                    {post.linkLabel || "Learn More"}
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              )}

              {/* Engagement Metrics */}
              <div className="flex items-center gap-6 pt-4 border-t border-border/60">
                <button
                  onClick={() => handleLike(post.id)}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-all duration-200 rounded-lg px-3 py-1.5",
                    isLiked
                      ? "text-primary bg-primary/10 hover:bg-primary/15"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <ThumbsUp className={cn("h-4 w-4 transition-transform", isLiked && "fill-current scale-110")} />
                  <span>{post.likes}</span>
                </button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>{post.views}</span>
                </div>
              </div>
            </Card>
          )
        })}

        {allPosts.length === 0 && (
          <Card className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <FileText className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  No news feed posts yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Check back later for updates and announcements!
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

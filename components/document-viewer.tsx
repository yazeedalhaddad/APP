"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, GitBranch, Plus, Eye, Download, Clock, User, Calendar, Shield } from "lucide-react"
import { useAppStore } from "@/stores/app-store"

export function DocumentViewer() {
  const {
    activeDocument,
    documentVersions,
    documentComparison,
    user,
    isLoading,
    selectDocument,
    fetchDocumentVersions,
    compareDocumentVersions,
    createDraft,
  } = useAppStore()

  const [createDraftOpen, setCreateDraftOpen] = useState(false)
  const [draftName, setDraftName] = useState("")
  const [draftDescription, setDraftDescription] = useState("")
  const [compareVersions, setCompareVersions] = useState<{ from: number; to: number } | null>(null)
  const [selectedVersions, setSelectedVersions] = useState<{ from?: number; to?: number }>({})

  useEffect(() => {
    if (activeDocument) {
      fetchDocumentVersions(activeDocument.id)
    }
  }, [activeDocument, fetchDocumentVersions])

  const handleBack = () => {
    selectDocument("")
  }

  const handleCreateDraft = async () => {
    if (!activeDocument || !draftName.trim()) return

    await createDraft(activeDocument.id, draftName, draftDescription)
    setCreateDraftOpen(false)
    setDraftName("")
    setDraftDescription("")
  }

  const handleCompareVersions = () => {
    if (!activeDocument || !selectedVersions.from || !selectedVersions.to) return

    compareDocumentVersions(activeDocument.id, selectedVersions.from, selectedVersions.to)
    setCompareVersions({ from: selectedVersions.from, to: selectedVersions.to })
  }

  if (!activeDocument) {
    return null
  }

  const officialVersion = documentVersions.find((v) => v.is_official)
  const canCreateDraft = user && ["admin", "management", "production", "lab"].includes(user.role)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{activeDocument.title}</h1>
            <p className="text-muted-foreground">{activeDocument.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge
            variant={
              activeDocument.classification === "confidential"
                ? "destructive"
                : activeDocument.classification === "internal"
                  ? "outline"
                  : "secondary"
            }
          >
            <Shield className="mr-1 h-3 w-3" />
            {activeDocument.classification}
          </Badge>
          {canCreateDraft && (
            <Dialog open={createDraftOpen} onOpenChange={setCreateDraftOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Draft
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Draft</DialogTitle>
                  <DialogDescription>
                    Create a new draft based on the current official version of this document.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="draft-name">Draft Name</Label>
                    <Input
                      id="draft-name"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      placeholder="Enter draft name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="draft-description">Description (Optional)</Label>
                    <Textarea
                      id="draft-description"
                      value={draftDescription}
                      onChange={(e) => setDraftDescription(e.target.value)}
                      placeholder="Describe the changes you plan to make"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDraftOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateDraft} disabled={!draftName.trim() || isLoading}>
                    Create Draft
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Document Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Owner: {activeDocument.owner?.name || "Unknown"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Created: {new Date(activeDocument.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Updated: {new Date(activeDocument.updated_at).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Current Version</CardTitle>
          </CardHeader>
          <CardContent>
            {officialVersion ? (
              <div className="space-y-2">
                <div className="text-lg font-semibold">v{officialVersion.version_number}</div>
                <p className="text-sm text-muted-foreground">
                  {officialVersion.change_summary || "No summary available"}
                </p>
                <Button size="sm" variant="outline" className="w-full bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No official version found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button size="sm" variant="outline" className="w-full bg-transparent">
              <Eye className="mr-2 h-4 w-4" />
              Preview Document
            </Button>
            <Button size="sm" variant="outline" className="w-full bg-transparent">
              <GitBranch className="mr-2 h-4 w-4" />
              View All Drafts
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="versions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="versions">Version History</TabsTrigger>
          <TabsTrigger value="compare">Compare Versions</TabsTrigger>
        </TabsList>

        <TabsContent value="versions">
          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
              <CardDescription>All versions of this document, including drafts and official releases</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-8 w-16" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[300px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Version</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Summary</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentVersions.map((version) => (
                      <TableRow key={version.id}>
                        <TableCell className="font-medium">v{version.version_number}</TableCell>
                        <TableCell>
                          <Badge variant={version.is_official ? "default" : "secondary"}>
                            {version.is_official ? "Official" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{version.change_summary || "No summary"}</TableCell>
                        <TableCell>{version.created_by_name || "Unknown"}</TableCell>
                        <TableCell>{new Date(version.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compare">
          <Card>
            <CardHeader>
              <CardTitle>Compare Versions</CardTitle>
              <CardDescription>Select two versions to see the differences between them</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>From Version</Label>
                  <Select
                    value={selectedVersions.from?.toString()}
                    onValueChange={(value) =>
                      setSelectedVersions((prev) => ({ ...prev, from: Number.parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select version" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentVersions.map((version) => (
                        <SelectItem key={version.id} value={version.version_number.toString()}>
                          v{version.version_number} {version.is_official ? "(Official)" : "(Draft)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>To Version</Label>
                  <Select
                    value={selectedVersions.to?.toString()}
                    onValueChange={(value) => setSelectedVersions((prev) => ({ ...prev, to: Number.parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select version" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentVersions.map((version) => (
                        <SelectItem key={version.id} value={version.version_number.toString()}>
                          v{version.version_number} {version.is_official ? "(Official)" : "(Draft)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleCompareVersions}
                disabled={!selectedVersions.from || !selectedVersions.to || isLoading}
              >
                Compare Versions
              </Button>

              {documentComparison && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Comparison: v{documentComparison.fromVersion} → v{documentComparison.toVersion}
                    </h3>
                  </div>

                  <div className="border rounded-lg p-4 space-y-2 max-h-96 overflow-y-auto">
                    {documentComparison.diff.map((change: any, index: number) => (
                      <div
                        key={index}
                        className={`p-2 rounded text-sm font-mono ${
                          change.type === "added"
                            ? "bg-green-50 border-l-4 border-green-500 text-green-800"
                            : change.type === "deleted"
                              ? "bg-red-50 border-l-4 border-red-500 text-red-800"
                              : change.type === "modified"
                                ? "bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800"
                                : "bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">Line {change.line}:</span>
                          {change.type === "modified" ? (
                            <div className="space-y-1">
                              <div className="text-red-600">- {change.oldContent}</div>
                              <div className="text-green-600">+ {change.newContent}</div>
                            </div>
                          ) : (
                            <span>
                              {change.type === "added" && "+ "}
                              {change.type === "deleted" && "- "}
                              {change.content}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

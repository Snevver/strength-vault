import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calendar, Plus } from "lucide-react";

const Progress = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monthly Progress</h1>
          <p className="text-muted-foreground">
            Track your strength gains month by month
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                2024 Progress Overview
              </CardTitle>
              <CardDescription>
                Monthly maximum weights for all exercises
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sample progress data */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground">UPPER BODY</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 rounded border">
                      <span className="text-sm">Incline Smith</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">75kg</Badge>
                        <Badge className="text-xs progress-up">+5kg</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded border">
                      <span className="text-sm">Chest Press</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">70kg</Badge>
                        <Badge className="text-xs progress-up">+2.5kg</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded border">
                      <span className="text-sm">Pulldown Lat</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">60kg</Badge>
                        <Badge className="text-xs progress-neutral">0kg</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground">LOWER BODY</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 rounded border">
                      <span className="text-sm">Squats/Legpress</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">110kg</Badge>
                        <Badge className="text-xs progress-up">+10kg</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded border">
                      <span className="text-sm">RDLs</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">85kg</Badge>
                        <Badge className="text-xs progress-up">+5kg</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded border">
                      <span className="text-sm">Leg Extensions</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">50kg</Badge>
                        <Badge className="text-xs progress-up">+5kg</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  This Month
                </CardTitle>
                <CardDescription>September 2024</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 rounded-lg bg-success/10 border border-success/20">
                  <div className="text-2xl font-bold text-success">+12.5kg</div>
                  <div className="text-sm text-muted-foreground">Total progress</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center p-2 rounded bg-muted/50">
                    <div className="font-semibold">8</div>
                    <div className="text-muted-foreground">PRs</div>
                  </div>
                  <div className="text-center p-2 rounded bg-muted/50">
                    <div className="font-semibold">15</div>
                    <div className="text-muted-foreground">Workouts</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full btn-touch" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Year
                </Button>
                <Button className="w-full btn-touch" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  View 2023 Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Progress;
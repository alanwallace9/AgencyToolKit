import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Plus } from "lucide-react"

export default function CustomersPage() {
  return (
    <>
      <PageHeader
        title="Customers"
        description="Manage your GHL sub-account customers"
        action={
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium">No customers yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Add your first customer to start customizing their GHL experience.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Coming in Feature 6
          </p>
        </CardContent>
      </Card>
    </>
  )
}

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import RolesContext from "@/context/roles-context";
import axiosInstance from "@/service/axios";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

const grants = [
  { label: "Authorization Code", value: "authorization_code" },
  { label: "Refresh Token", value: "refresh_token" },
  { label: "Client Credentials", value: "client_credentials" },
];

export default function ApplicationCreator({ onCreate }: { onCreate?: any }) {
  const [open, setOpen] = useState(false);
  const [selectedGrants, setSelectedGrants] = useState<any[]>([]);

  const onGrantSelect = (g: any) => {
    console.log(g);
    setSelectedGrants(g);
  };

  const { roles, refreshRoles } = useContext(RolesContext);

  useEffect(() => {
    if (!roles) refreshRoles();
  }, [roles, refreshRoles]);

  const formDefaults = {
    id: "",
    displayName: "",
    secret: "",
    role: "",
    redirectUris: "",
  };

  const form = useForm({
    defaultValues: formDefaults,
  });

  async function onSubmit(formValues: any) {
    formValues = {
      ...formValues,
      grants: selectedGrants,
    };
    formValues.redirectUris = formValues.redirectUris.split(",");
    console.log(formValues);
    const promise = axiosInstance.post("/client/admin-api/create", formValues);
    toast.promise(promise, {
      pending: "Submitting...",
      success: "Creation successfull",
      error: "Creation failed!",
    });
    const result = await promise;
    setOpen(false);
    if (onCreate) {
      onCreate(result.data.data.client);
    }
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2">
          Create Application
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-full md:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Application</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-2 p-4 max-h-[60vh] overflow-y-auto"
            >
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application ID</FormLabel>
                    <FormControl>
                      <Input {...field} minLength={8} />
                    </FormControl>
                    <FormDescription>
                      Must be atleast 8 characters long. Can include alphabets,
                      numbers and underscores.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input {...field} minLength={8} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Secret</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent defaultValue="external_client">
                        <SelectItem value="internal_client">
                          Internal Client
                        </SelectItem>
                        <SelectItem value="external_client">
                          External Client
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Grants</FormLabel>
                <ToggleGroup
                  size={"sm"}
                  type="multiple"
                  onValueChange={onGrantSelect}
                >
                  {grants.map((grant) => (
                    <ToggleGroupItem
                      value={grant.value}
                      aria-label={grant.label}
                      className="text-xs"
                    >
                      {grant.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </FormItem>
              <FormField
                control={form.control}
                name="redirectUris"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Redirect URIs</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormDescription>
                      Comma separated list of redirect URIs.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Save changes</Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { ArrowRightIcon, MailIcon, MapPinIcon, MessageSquareIcon, PhoneIcon, UserIcon } from "lucide-react";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import toast from "react-hot-toast";
import Softbackdrop from "../components/Softbackdrop";

type ContactForm = {
   name: string;
   email: string;
   subject: string;
   message: string;
};

const initialForm: ContactForm = {
   name: "",
   email: "",
   subject: "",
   message: "",
};

const contactCards = [
   {
      title: "Email support",
      value: "support@aithumbnailgenerator.dev",
      description: "Feature help, billing questions, or bug reports.",
      icon: MailIcon,
   },
   {
      title: "Creator success",
      value: "+91 98765 43210",
      description: "Need help improving your thumbnail workflow?",
      icon: PhoneIcon,
   },
   {
      title: "Based in",
      value: "India, remote-first",
      description: "We work with creators and teams worldwide.",
      icon: MapPinIcon,
   },
] as const;

export default function ContactUs() {
   const [formData, setFormData] = useState<ContactForm>(initialForm);
   const [isSubmitting, setIsSubmitting] = useState(false);

   const isValid = useMemo(() => {
      return (
         formData.name.trim().length >= 2 &&
         /\S+@\S+\.\S+/.test(formData.email) &&
         formData.subject.trim().length >= 3 &&
         formData.message.trim().length >= 10
      );
   }, [formData]);

   const handleChange = (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
   ) => {
      const { name, value } = event.target;
      setFormData((current) => ({ ...current, [name]: value }));
   };

   const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!isValid) {
         toast.error("Please fill all fields properly before submitting.");
         return;
      }

      try {
         setIsSubmitting(true);
         await new Promise((resolve) => setTimeout(resolve, 700));
         toast.success("Your message is ready. Opening your email app now.");

         const params = new URLSearchParams({
            subject: `[AI Thumbnail Generator] ${formData.subject}`,
            body: `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`,
         });

         window.location.href = `mailto:support@aithumbnailgenerator.dev?${params.toString()}`;
         setFormData(initialForm);
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <>
         <Softbackdrop />
         <main className="min-h-screen px-6 pb-20 pt-28 md:px-16 lg:px-24 xl:px-32">
            <section className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
               <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-pink-500/10 px-4 py-2 text-sm text-pink-200">
                     <MessageSquareIcon className="size-4" />
                     Contact us
                  </div>

                  <div className="space-y-4">
                     <h1 className="max-w-2xl text-4xl font-bold leading-tight text-white md:text-5xl">
                        Let&apos;s build thumbnails your audience actually clicks.
                     </h1>
                     <p className="max-w-2xl text-base leading-7 text-zinc-300 md:text-lg">
                        Reach out for product help, creator support, or partnership
                        conversations. We&apos;ll help you get unstuck fast.
                     </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                     {contactCards.map(({ title, value, description, icon: Icon }) => (
                        <div
                           key={title}
                           className="rounded-3xl border border-white/10 bg-white/6 p-5 shadow-xl backdrop-blur"
                        >
                           <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/8 p-3 text-pink-300">
                              <Icon className="size-5" />
                           </div>
                           <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-400">
                              {title}
                           </h2>
                           <p className="mt-3 text-base font-semibold text-white">
                              {value}
                           </p>
                           <p className="mt-2 text-sm leading-6 text-zinc-400">
                              {description}
                           </p>
                        </div>
                     ))}
                  </div>
               </div>

               <form
                  onSubmit={handleSubmit}
                  className="rounded-[2rem] border border-white/10 bg-black/25 p-6 shadow-2xl backdrop-blur md:p-8"
               >
                  <div className="mb-6">
                     <h2 className="text-2xl font-semibold text-white">
                        Send a message
                     </h2>
                     <p className="mt-2 text-sm text-zinc-400">
                        We&apos;ll open your email app with everything pre-filled.
                     </p>
                  </div>

                  <div className="grid gap-4">
                     <label className="space-y-2">
                        <span className="text-sm font-medium text-zinc-200">
                           Your name
                        </span>
                        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                           <UserIcon className="size-4 text-zinc-400" />
                           <input
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              placeholder="Enter your name"
                              className="w-full bg-transparent text-white outline-none placeholder:text-zinc-500"
                           />
                        </div>
                     </label>

                     <label className="space-y-2">
                        <span className="text-sm font-medium text-zinc-200">
                           Email address
                        </span>
                        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                           <MailIcon className="size-4 text-zinc-400" />
                           <input
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="you@example.com"
                              className="w-full bg-transparent text-white outline-none placeholder:text-zinc-500"
                           />
                        </div>
                     </label>

                     <label className="space-y-2">
                        <span className="text-sm font-medium text-zinc-200">
                           Subject
                        </span>
                        <input
                           name="subject"
                           value={formData.subject}
                           onChange={handleChange}
                           placeholder="What do you need help with?"
                           className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-zinc-500"
                        />
                     </label>

                     <label className="space-y-2">
                        <span className="text-sm font-medium text-zinc-200">
                           Message
                        </span>
                        <textarea
                           name="message"
                           rows={6}
                           value={formData.message}
                           onChange={handleChange}
                           placeholder="Tell us what you're building, what's blocked, or what you'd like to improve."
                           className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-zinc-500"
                        />
                     </label>
                  </div>

                  <button
                     type="submit"
                     disabled={isSubmitting}
                     className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-pink-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-pink-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                     {isSubmitting ? "Preparing email..." : "Send message"}
                     <ArrowRightIcon className="size-4" />
                  </button>
               </form>
            </section>
         </main>
      </>
   );
}

import Softbackdrop from "../components/Softbackdrop";

export default function PrivacyPolicy() {
   return (
      <>
         <Softbackdrop />
         <main className="min-h-screen px-6 pb-20 pt-32 md:px-16 lg:px-24 xl:px-32 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
            <div className="text-zinc-300 space-y-6">
               <p>Last updated: {new Date().toLocaleDateString()}</p>
               <p>Your privacy is important to us. It is ClickFrame's policy to respect your privacy regarding any information we may collect from you across our website.</p>
               <h2 className="text-xl font-semibold text-white mt-8">Information We Collect</h2>
               <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.</p>
               <h2 className="text-xl font-semibold text-white mt-8">How We Use Information</h2>
               <p>We use the information we collect in various ways, including to provide, operate, and maintain our website; improve, personalize, and expand our website; understand and analyze how you use our website.</p>
               <h2 className="text-xl font-semibold text-white mt-8">Contact Us</h2>
               <p>If you have any questions about this Privacy Policy, please contact us.</p>
            </div>
         </main>
      </>
   );
}

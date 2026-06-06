import Softbackdrop from "../components/Softbackdrop";

export default function TermsOfService() {
   return (
      <>
         <Softbackdrop />
         <main className="min-h-screen px-6 pb-20 pt-32 md:px-16 lg:px-24 xl:px-32 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>
            <div className="text-zinc-300 space-y-6">
               <p>Last updated: {new Date().toLocaleDateString()}</p>
               <p>By accessing our website, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
               <h2 className="text-xl font-semibold text-white mt-8">Use License</h2>
               <p>Permission is granted to temporarily download one copy of the materials (information or software) on ClickFrame's website for personal, non-commercial transitory viewing only.</p>
               <h2 className="text-xl font-semibold text-white mt-8">Disclaimer</h2>
               <p>The materials on ClickFrame's website are provided on an 'as is' basis. ClickFrame makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
               <h2 className="text-xl font-semibold text-white mt-8">Limitations</h2>
               <p>In no event shall ClickFrame or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ClickFrame's website.</p>
            </div>
         </main>
      </>
   );
}

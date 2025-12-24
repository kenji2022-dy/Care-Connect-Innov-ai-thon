// This file contains optional Clerk configuration
// You can customize the appearance and behavior of Clerk components here

export const clerkConfig = {
  appearance: {
    elements: {
      formButtonPrimary: 
        "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300",
      card: "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-gray-200 dark:border-slate-700 shadow-2xl",
      headerTitle: "text-gray-900 dark:text-white",
      headerSubtitle: "text-gray-600 dark:text-gray-400",
      socialButtonsBlockButton: "bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600",
      formFieldInput: "bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white",
      footerActionLink: "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
    }
  }
}

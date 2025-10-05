import React from 'react'
import { Mail } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-muted/20 py-4 text-center text-sm text-muted-foreground">
      <div className="container mx-auto flex flex-col items-center gap-2">
        <p className="font-medium text-foreground">
          <strong>DTU Studio </strong> © {currentYear}
        </p>
        <p className="flex items-center gap-1">
          <Mail className="w-4 h-4" />
          For feedback or error reporting,&nbsp;
          <a href="mailto:support@mywebsite.com" className="text-primary hover:underline">
            sanchitvohra_23ec179@dtu.ac.in
          </a>
        </p>
      </div>
    </footer>
  )
}

export default Footer

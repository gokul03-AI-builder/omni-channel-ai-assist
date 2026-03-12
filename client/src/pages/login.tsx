import { useState } from "react";
import { motion } from "framer-motion";
import { Headphones, Shield, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import verifoneLogo from "@assets/verifone_logo_1772712551074.png";

const roles = [
  {
    id: "agent",
    title: "Support Agent",
    name: "Alex Morgan",
    initials: "AM",
    description: "Handle customer calls with real-time AI assist, live transcription, and KB search",
    icon: Headphones,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/40",
    glowColor: "shadow-[0_0_30px_rgba(110,255,210,0.15)]",
  },
  {
    id: "admin",
    title: "Admin",
    name: "Gokul Nair",
    initials: "GN",
    description: "Full platform access with analytics, reports, and system configuration",
    icon: Shield,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-400/40",
    glowColor: "shadow-[0_0_30px_rgba(139,92,246,0.15)]",
  },
];

const wingPath1 = "M 0,0 C -30,-15 -70,-20 -120,-10 C -150,-5 -170,5 -180,15";
const wingPath2 = "M 0,0 C 30,-15 70,-20 120,-10 C 150,-5 170,5 180,15";

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleSignIn = () => {
    if (!selectedRole) return;
    localStorage.setItem("wingman_auth", selectedRole);
    onLogin();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" data-testid="page-login">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-mint-100/40 dark:bg-primary/[0.07] blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-mint-100/40 dark:bg-primary/[0.05] blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-mint-100/30 dark:bg-primary/[0.04] blur-3xl" />
      </div>

      <motion.div
        className="w-full max-w-2xl relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="flex flex-col items-center mb-8">
          <div className="relative mb-6">
            <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-primary/15 animate-ping" style={{ animationDuration: "2.5s" }} />
            <div className="absolute -inset-3 rounded-full border border-primary/10 animate-ping" style={{ animationDuration: "3s", animationDelay: "0.4s" }} />

            <motion.div
              className="relative w-20 h-20 rounded-2xl overflow-hidden glass-panel border border-primary/20 flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="rounded-lg overflow-hidden bg-slate-900 w-full h-full">
                <img
                  src={verifoneLogo}
                  alt="Verifone"
                  className="w-full h-full object-cover"
                  data-testid="img-login-logo"
                />
              </div>
            </motion.div>

            <svg
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible"
              width="360"
              height="80"
              viewBox="-180 -30 360 60"
            >
              <motion.path
                d={wingPath1}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
              />
              <motion.path
                d={wingPath2}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
              />

              {[-40, -80, -120, -160].map((offset, i) => (
                <motion.circle
                  key={`left-${i}`}
                  r="2.5"
                  fill="hsl(var(--primary))"
                  opacity="0"
                  initial={{ opacity: 0, cx: 0, cy: 0 }}
                  animate={{
                    opacity: [0, 0.7, 0.3],
                    cx: [0, offset * 0.5, offset],
                    cy: [0, -12, offset > -140 ? -8 : 5],
                  }}
                  transition={{
                    duration: 1.8,
                    ease: "easeOut",
                    delay: 1.2 + i * 0.15,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                />
              ))}
              {[40, 80, 120, 160].map((offset, i) => (
                <motion.circle
                  key={`right-${i}`}
                  r="2.5"
                  fill="hsl(var(--primary))"
                  opacity="0"
                  initial={{ opacity: 0, cx: 0, cy: 0 }}
                  animate={{
                    opacity: [0, 0.7, 0.3],
                    cx: [0, offset * 0.5, offset],
                    cy: [0, -12, offset < 140 ? -8 : 5],
                  }}
                  transition={{
                    duration: 1.8,
                    ease: "easeOut",
                    delay: 1.2 + i * 0.15,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                />
              ))}
            </svg>
          </div>

          <motion.h1
            className="text-3xl font-bold tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Verifone's <span className="text-primary">Wingman</span>
          </motion.h1>
          <motion.p
            className="text-sm text-muted-foreground mt-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            AI-Powered Agent Assist Platform
          </motion.p>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mb-6">
          {roles.map((role) => {
            const isSelected = selectedRole === role.id;
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`relative text-left p-5 rounded-2xl glass-panel border-2 transition-all duration-300 cursor-pointer group ${
                  isSelected
                    ? `${role.borderColor} ${role.glowColor}`
                    : "border-transparent hover:border-border/40"
                }`}
                data-testid={`card-role-${role.id}`}
              >
                {isSelected && (
                  <motion.div
                    className="absolute top-3 right-3"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    <div className={`w-6 h-6 rounded-full ${role.bgColor} flex items-center justify-center`}>
                      <Check className={`w-3.5 h-3.5 ${role.color}`} />
                    </div>
                  </motion.div>
                )}

                <div className={`w-10 h-10 rounded-xl ${role.bgColor} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${role.color}`} />
                </div>

                <h3 className="text-base font-semibold mb-0.5">{role.title}</h3>
                <p className={`text-sm font-medium ${role.color} mb-2`}>{role.name}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{role.description}</p>
              </button>
            );
          })}
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-3">
          <Button
            onClick={handleSignIn}
            disabled={!selectedRole}
            className={`w-full h-12 rounded-2xl gap-2 text-base font-semibold transition-all duration-300 ${
              selectedRole
                ? "bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
                : "bg-muted/30 text-muted-foreground border border-border/20"
            }`}
            data-testid="button-sign-in"
          >
            Sign In
            <ArrowRight className="w-4 h-4" />
          </Button>
          <p className="text-xs text-muted-foreground text-center" data-testid="text-demo-hint">
            Demo login — select a role to continue
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

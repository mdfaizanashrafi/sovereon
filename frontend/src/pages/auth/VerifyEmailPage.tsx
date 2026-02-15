import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, ArrowRight, Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail, isLoading } = useAuth();
  
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      handleVerify(tokenFromUrl);
    }
  }, [searchParams]);
  
  const handleVerify = async (tokenToVerify: string) => {
    if (!tokenToVerify) return;
    
    setStatus('verifying');
    setMessage('');
    
    try {
      const result = await verifyEmail(tokenToVerify);
      if (result) {
        setStatus('success');
      } else {
        setStatus('error');
        setMessage('The verification link is invalid or has expired.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred during verification. Please try again.');
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(token);
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-foreground">Sovereon</span>
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-border/50 shadow-xl shadow-black/5">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
                <p className="text-muted-foreground mb-6">
                  Your email has been successfully verified. You can now sign in to your account.
                </p>
                <Button onClick={() => navigate('/auth/login?verified=true')} className="w-full">
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-foreground">Sovereon</span>
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/50 shadow-xl shadow-black/5">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Verify your email
              </CardTitle>
              <CardDescription className="text-center">
                Enter the verification token from your email
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Error Message */}
              {status === 'error' && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Token Input */}
                <div className="space-y-2">
                  <Label htmlFor="token">Verification Token</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="token"
                      type="text"
                      placeholder="Enter your verification token"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="pl-10"
                      disabled={isLoading || status === 'verifying'}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    For demo: Check sessionStorage for your verification token with key: <code className="text-xs bg-muted px-1 py-0.5 rounded">verify_your@email.com</code>
                  </p>
                </div>
                
                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || status === 'verifying' || !token}
                >
                  {status === 'verifying' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Email
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Already verified?{' '}
                <Link 
                  to="/auth/login" 
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
              
              <p className="text-center text-sm text-muted-foreground">
                Didn't receive the email?{' '}
                <button 
                  onClick={() => navigate('/auth/register')}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Register again
                </button>
              </p>
              
              <Link 
                to="/"
                className="text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to homepage
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

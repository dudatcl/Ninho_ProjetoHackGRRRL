import { useApp } from '@/state/AppState';
import Onboarding from './Onboarding';
import Dashboard from './Dashboard';

const Index = () => {
  const { profile } = useApp();
  return profile ? <Dashboard /> : <Onboarding />;
};

export default Index;

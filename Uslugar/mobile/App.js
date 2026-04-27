import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, SafeAreaView, Text } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import ProtectedShell from './src/screens/ProtectedShell';
import { styles } from './src/styles';
import { useAuthSession } from './src/hooks/useAuthSession';
import { useJobsFlow } from './src/hooks/useJobsFlow';
import { useChatFlow } from './src/hooks/useChatFlow';
import { usePushNotifications } from './src/hooks/usePushNotifications';
import { useBillingFlow } from './src/hooks/useBillingFlow';
import { useAdminLiteFlow } from './src/hooks/useAdminLiteFlow';
import { usePublicProviders } from './src/hooks/usePublicProviders';
import { useGrowthFlow } from './src/hooks/useGrowthFlow';

export default function App() {
  const auth = useAuthSession();
  const jobsFlow = useJobsFlow({
    apiBaseUrl: auth.apiBaseUrl,
    token: auth.token,
    user: auth.user,
    setLoading: auth.setLoading,
    setMessage: auth.setMessage,
    handleApiError: auth.handleApiError
  });
  const chatFlow = useChatFlow({
    apiBaseUrl: auth.apiBaseUrl,
    token: auth.token,
    setLoading: auth.setLoading,
    setMessage: auth.setMessage,
    handleApiError: auth.handleApiError
  });
  const push = usePushNotifications({
    apiBaseUrl: auth.apiBaseUrl,
    token: auth.token,
    setMessage: auth.setMessage,
    handleApiError: auth.handleApiError
  });
  const billing = useBillingFlow({
    apiBaseUrl: auth.apiBaseUrl,
    token: auth.token,
    user: auth.user,
    setLoading: auth.setLoading,
    setMessage: auth.setMessage,
    handleApiError: auth.handleApiError
  });
  const admin = useAdminLiteFlow({
    apiBaseUrl: auth.apiBaseUrl,
    token: auth.token,
    user: auth.user,
    setLoading: auth.setLoading,
    setMessage: auth.setMessage,
    handleApiError: auth.handleApiError
  });
  const showProvidersTab = auth.user?.role !== 'ADMIN';
  const publicProviders = usePublicProviders({
    apiBaseUrl: auth.apiBaseUrl,
    token: auth.token,
    active: Boolean(showProvidersTab && jobsFlow.activeTab === 'providers'),
    handleApiError: auth.handleApiError
  });
  const growth = useGrowthFlow({
    apiBaseUrl: auth.apiBaseUrl,
    token: auth.token,
    setMessage: auth.setMessage,
    handleApiError: auth.handleApiError
  });

  if (auth.bootstrapping) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.bootstrapText}>Provjeravam postojeću sesiju...</Text>
      </SafeAreaView>
    );
  }

  if (auth.token && auth.user) {
    return (
      <SafeAreaView style={styles.container}>
        <ProtectedShell
          user={auth.user}
          loading={auth.loading}
          message={auth.message}
          activeTab={jobsFlow.activeTab}
          setActiveTab={jobsFlow.setActiveTab}
          selectedJob={jobsFlow.selectedJob}
          setSelectedJob={jobsFlow.setSelectedJob}
          jobs={jobsFlow.jobs}
          myJobs={jobsFlow.myJobs}
          myOffers={jobsFlow.myOffers}
          loadBaseData={jobsFlow.loadBaseData}
          openJobDetails={jobsFlow.openJobDetails}
          jobOffers={jobsFlow.jobOffers}
          offerAmount={jobsFlow.offerAmount}
          setOfferAmount={jobsFlow.setOfferAmount}
          offerDays={jobsFlow.offerDays}
          setOfferDays={jobsFlow.setOfferDays}
          offerMessage={jobsFlow.offerMessage}
          setOfferMessage={jobsFlow.setOfferMessage}
          handleSubmitOffer={jobsFlow.handleSubmitOffer}
          chat={chatFlow}
          push={push}
          billing={billing}
          admin={admin}
          publicProviders={publicProviders}
          showProvidersTab={showProvidersTab}
          growth={growth}
          handleRefreshProfile={auth.handleRefreshProfile}
          onDeleteAccount={async (password) => {
            const ok = await auth.handleDeleteAccount(password);
            if (ok) {
              jobsFlow.resetJobSelection();
              chatFlow.resetRoom();
            }
            return ok;
          }}
          handleLogout={async () => {
            jobsFlow.resetJobSelection();
            chatFlow.resetRoom();
            await auth.handleLogout();
          }}
        />
        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LoginScreen
        apiBaseUrl={auth.apiBaseUrl}
        setApiBaseUrl={auth.setApiBaseUrl}
        email={auth.email}
        setEmail={auth.setEmail}
        password={auth.password}
        setPassword={auth.setPassword}
        loading={auth.loading}
        onLogin={auth.handleLogin}
        message={auth.message}
      />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

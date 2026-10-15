import React from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

export function ProfileTabs({ tabs }: { tabs: { id: string; label: string; content: React.ReactNode }[] }) {
  const [params, setParams] = useSearchParams();
  const active = tabs.find((tab) => tab.id === params.get('tab'))?.id || tabs[0].id;
  return <>
    <Tabs value={active} variant="scrollable" scrollButtons="auto" aria-label="Các mục hồ sơ" onChange={(_, value) => {
      setParams((previous) => { const next = new URLSearchParams(previous); next.set('tab', value); return next; }, { replace: true });
    }} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      {tabs.map((tab) => <Tab key={tab.id} value={tab.id} label={tab.label} id={`profile-tab-${tab.id}`} aria-controls={`profile-panel-${tab.id}`} />)}
    </Tabs>
    {tabs.map((tab) => <Box key={tab.id} role="tabpanel" hidden={active !== tab.id} id={`profile-panel-${tab.id}`} aria-labelledby={`profile-tab-${tab.id}`}>
      {active === tab.id && tab.content}
    </Box>)}
  </>;
}

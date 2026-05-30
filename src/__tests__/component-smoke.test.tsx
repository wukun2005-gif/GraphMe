import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { AppProvider } from '../store/AppContext';

// Components to smoke test (highest risk by bug-fix frequency)
import NavigationSidebar from '../components/Navigation';
import DetailPanel from '../components/DetailPanel';
import ChatPanel from '../components/ChatPanel';
import ValueDashboard from '../components/ValueDashboard';
import MemoryBank from '../components/MemoryBank';
import SerendipityModal from '../components/SerendipityModal';
import StoryWeaver from '../components/StoryWeaver';
import AnnualReport from '../components/AnnualReport';
import MemoryCinema from '../components/MemoryCinema';
import DreamWeaver from '../components/DreamWeaver';
import MemorySurprise from '../components/MemorySurprise';
import FlywheelView from '../components/FlywheelView';
import SocialGraph from '../components/SocialGraph';
import MemoryGarden from '../components/MemoryGarden';
import ConfusionDiary from '../components/ConfusionDiary';
import KnowledgeGap from '../components/KnowledgeGap';
import MorePanel from '../components/MorePanel';
import FlywheelFeedback from '../components/FlywheelFeedback';
import DailyMemoryCard from '../components/DailyMemoryCard';
import TimelineScrubber from '../components/TimelineScrubber';
import MemoryReader from '../components/MemoryReader';
import { rawMemories } from '../data/demoData';

beforeEach(() => {
  localStorage.clear();
});

function renderWithProvider(ui: React.ReactElement) {
  return render(ui, {
    wrapper: ({ children }) => <AppProvider>{children}</AppProvider>,
  });
}

describe('Component Smoke Tests — Render Without Crash', () => {
  // Zero-prop components (use context only)
  it('NavigationSidebar renders without crashing', () => {
    expect(() => renderWithProvider(<NavigationSidebar />)).not.toThrow();
  });

  it('DetailPanel renders without crashing', () => {
    expect(() => renderWithProvider(<DetailPanel />)).not.toThrow();
  });

  it('ChatPanel renders without crashing', () => {
    expect(() => renderWithProvider(<ChatPanel />)).not.toThrow();
  });

  it('ValueDashboard renders without crashing', () => {
    expect(() => renderWithProvider(<ValueDashboard />)).not.toThrow();
  });

  it('MemoryBank renders without crashing', () => {
    expect(() => renderWithProvider(<MemoryBank />)).not.toThrow();
  });

  it('MemorySurprise renders without crashing', () => {
    expect(() => renderWithProvider(<MemorySurprise />)).not.toThrow();
  });

  it('FlywheelFeedback renders without crashing', () => {
    expect(() => renderWithProvider(<FlywheelFeedback />)).not.toThrow();
  });

  it('DailyMemoryCard renders without crashing', () => {
    expect(() => renderWithProvider(<DailyMemoryCard />)).not.toThrow();
  });

  it('TimelineScrubber renders without crashing', () => {
    expect(() => renderWithProvider(<TimelineScrubber />)).not.toThrow();
  });

  // Components with props
  it('SerendipityModal renders without crashing (closed)', () => {
    expect(() => renderWithProvider(<SerendipityModal open={false} onClose={() => {}} />)).not.toThrow();
  });

  it('StoryWeaver renders without crashing', () => {
    expect(() => renderWithProvider(<StoryWeaver onClose={() => {}} />)).not.toThrow();
  });

  it('AnnualReport renders without crashing (closed)', () => {
    expect(() => renderWithProvider(<AnnualReport open={false} onClose={() => {}} />)).not.toThrow();
  });

  it('MemoryCinema renders without crashing (closed)', () => {
    expect(() => renderWithProvider(
      <MemoryCinema open={false} onClose={() => {}} memories={rawMemories.slice(0, 3)} theme="dark" />
    )).not.toThrow();
  });

  it('DreamWeaver renders without crashing', () => {
    expect(() => renderWithProvider(<DreamWeaver onClose={() => {}} />)).not.toThrow();
  });

  it('FlywheelView renders without crashing (closed)', () => {
    expect(() => renderWithProvider(<FlywheelView open={false} onClose={() => {}} />)).not.toThrow();
  });

  it('SocialGraph renders without crashing (closed)', () => {
    expect(() => renderWithProvider(<SocialGraph open={false} onClose={() => {}} />)).not.toThrow();
  });

  it('MemoryGarden renders without crashing', () => {
    expect(() => renderWithProvider(<MemoryGarden onClose={() => {}} />)).not.toThrow();
  });

  it('ConfusionDiary renders without crashing (closed)', () => {
    expect(() => renderWithProvider(<ConfusionDiary open={false} onClose={() => {}} />)).not.toThrow();
  });

  it('KnowledgeGap renders without crashing (closed)', () => {
    expect(() => renderWithProvider(<KnowledgeGap open={false} onClose={() => {}} />)).not.toThrow();
  });

  it('MorePanel renders without crashing (closed)', () => {
    expect(() => renderWithProvider(
      <MorePanel features={[]} theme="dark" isShow={false} onClose={() => {}} />
    )).not.toThrow();
  });

  // MemoryReader — null guard regression test (BUG-112)
  it('MemoryReader renders without crashing with valid memories', () => {
    expect(() => renderWithProvider(
      <MemoryReader memories={rawMemories.slice(0, 3)} theme="dark" onClose={() => {}} />
    )).not.toThrow();
  });

  it('MemoryReader renders without crashing with empty memories (BUG-112 regression)', () => {
    expect(() => renderWithProvider(
      <MemoryReader memories={[]} theme="dark" onClose={() => {}} />
    )).not.toThrow();
  });
});

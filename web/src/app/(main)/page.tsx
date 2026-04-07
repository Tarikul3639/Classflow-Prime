"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDashboardData } from "@/store/features/dashboard/thunk/dashboard.thunk";
import {
  selectDashboardLoading,
  selectDashboardError,
  selectClasses,
  selectActiveClasses,
  selectUpdates,
  selectPinnedUpdates,
  selectUpcomingEvents,
  selectFaculty,
  selectGroups,
} from "@/store/features/dashboard/selectors/dashboard.selectors";

import DashboardHeader from "./_components/DashboardHeader";
import DashboardStats from "./_components/DashboardStats";
import MyClasses from "./_components/MyClasses";
import RecentUpdates from "./_components/RecentUpdates";
import Faculty from "./_components/Faculty";
import StudyGroups from "./_components/StudyGroups";
import DashboardSkeleton from "./_components/DashboardSkeleton";
import Welcome from "./_components/Welcome";
import ErrorState from "./_components/ErrorState";

export default function DashboardPage() {
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.profile.fetchUser.user);
  const isLoading = useAppSelector(selectDashboardLoading);
  const error = useAppSelector(selectDashboardError);
  const classes = useAppSelector(selectClasses);
  const activeClasses = useAppSelector(selectActiveClasses);
  const updates = useAppSelector(selectUpdates);
  const pinnedUpdates = useAppSelector(selectPinnedUpdates);
  const upcoming = useAppSelector(selectUpcomingEvents);
  const faculty = useAppSelector(selectFaculty);
  const groups = useAppSelector(selectGroups);

  useEffect(() => {
    // Only fetch if store is empty
    if (classes.length === 0) {
      dispatch(fetchDashboardData());
    }
  }, [dispatch, classes.length]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <DashboardHeader />

      <main className="flex-1 overflow-y-auto pb-24">
        {isLoading ? (
          <DashboardSkeleton />
        ) : error ? (
          <ErrorState
            message={error || "Failed to load dashboard data"}
            onRetry={() => dispatch(fetchDashboardData())}
          />
        ) : (
          <>
            {/* Welcome banner */}
            <Welcome user={user} />

            {/* Count */}
            <DashboardStats
              enrolledCount={classes.length}
              activeCount={activeClasses.length}
              pinnedCount={pinnedUpdates.length}
              upcomingCount={upcoming.length}
              groupCount={groups.length}
            />

            <MyClasses classes={classes} />
            <RecentUpdates updates={updates} />
            <Faculty facultyList={faculty} />
            <StudyGroups groups={groups} />
          </>
        )}
      </main>
    </div>
  );
}

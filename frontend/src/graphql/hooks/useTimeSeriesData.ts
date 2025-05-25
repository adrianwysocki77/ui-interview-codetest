import { useQuery } from "@apollo/client";
import { GET_TIME_SERIES_DATA } from "../queries/timeSeriesData";
import {
  TimeSeriesDataQueryVariables,
  TimeSeriesDataResponse,
  TimeRange,
  CriticalityLevel,
} from "@/types/graphql";

export const useTimeSeriesData = (
  variables: TimeSeriesDataQueryVariables = {}
) => {
  const { data, loading, error, refetch } = useQuery<
    TimeSeriesDataResponse,
    TimeSeriesDataQueryVariables
  >(GET_TIME_SERIES_DATA, {
    variables,
    // Refresh data every 30 seconds (30000ms) for more timely security updates
    pollInterval: 30000,
  });

  const changeTimeRange = async (timeRange: TimeRange) => {
    await refetch({ ...variables, timeRange });
  };

  const changeCriticalities = async (criticalities: CriticalityLevel[]) => {
    await refetch({ ...variables, criticalities });
  };

  return {
    data: data?.timeSeriesData,
    loading,
    error,
    changeTimeRange,
    changeCriticalities,
    refetch,
  };
};

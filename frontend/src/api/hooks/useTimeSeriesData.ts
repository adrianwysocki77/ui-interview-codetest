import { useQuery } from "@apollo/client";
import { GET_TIME_SERIES_DATA } from "../queries/timeSeriesData";
import {
  TimeSeriesDataQueryVariables,
  TimeSeriesDataResponse,
  TimeRange,
  CriticalityLevel,
} from "@/types/graphql";
import { useSnackbar } from "@/providers/snackbar/SnackbarContext";

// Simple error handler using snackbar
const useErrorHandler = () => {
  const { showError } = useSnackbar();
  return {
    handleGraphQLError: (message: string) => {
      console.error(`GraphQL Error: ${message}`);
      showError(`GraphQL Error: ${message}`);
    }
  };
};

export const useTimeSeriesData = (
  variables: TimeSeriesDataQueryVariables = {}
) => {
  const { handleGraphQLError } = useErrorHandler();

  const { data, loading, error, refetch } = useQuery<
    TimeSeriesDataResponse,
    TimeSeriesDataQueryVariables
  >(GET_TIME_SERIES_DATA, {
    variables,
    // Refresh data every 30 seconds (30000ms) for security updates
    pollInterval: 30000,
    onError: (error) => {
      if (error.graphQLErrors?.length) {
        error.graphQLErrors.forEach(err => {
          handleGraphQLError(err.message);
        });
      }
    }
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

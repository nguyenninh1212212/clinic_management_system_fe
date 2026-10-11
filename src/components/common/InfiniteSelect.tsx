import {
    Autocomplete,
    CircularProgress,
    TextField,
} from "@mui/material";
import type {
    AutocompleteProps,
    TextFieldProps,
} from "@mui/material";
import {
    useInfiniteQuery,
    type QueryKey,
} from "@tanstack/react-query";
import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

export interface InfiniteSelectPage<T> {
    data: T[];
    nextPage?: number | null;
}

type BaseAutocompleteProps<T> = Omit<
    AutocompleteProps<T, false, false, false>,
    | "options"
    | "value"
    | "onChange"
    | "onInputChange"
    | "getOptionLabel"
    | "isOptionEqualToValue"
    | "renderInput"
    | "loading"
>;

export interface InfiniteSelectProps<T, V = string>
    extends BaseAutocompleteProps<T> {
    label: string;
    value: V | null;
    onChange: (value: V | null, option: T | null) => void;

    queryKey: QueryKey;
    queryFn: (params: {
        page: number;
        search: string;
    }) => Promise<InfiniteSelectPage<T>>;

    getOptionLabel: (option: T) => string;
    getOptionValue: (option: T) => V;

    placeholder?: string;
    helperText?: string;
    textFieldProps?: Omit<
        TextFieldProps,
        "label" | "value" | "onChange"
    >;
    debounceMs?: number;
    enabled?: boolean;
}

export function InfiniteSelect<T, V = string>({
    label,
    value,
    onChange,
    queryKey,
    queryFn,
    getOptionLabel,
    getOptionValue,
    placeholder = "Tìm kiếm...",
    helperText,
    textFieldProps,
    debounceMs = 300,
    enabled = true,
    ...autocompleteProps
}: InfiniteSelectProps<T, V>) {
    const [inputValue, setInputValue] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const fetchingNextPageRef = useRef(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [searchInput, debounceMs]);

    const {
        data,
        isLoading,
        isError,
        isFetching,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteQuery({
        queryKey: [...queryKey, "infinite-select", search],
        initialPageParam: 1,
        queryFn: ({ pageParam }) =>
            queryFn({
                page: pageParam,
                search,
            }),
        getNextPageParam: (lastPage) =>
            lastPage.data.length > 0 ? lastPage.nextPage ?? undefined : undefined,
        enabled,
    });

    const options = useMemo(
        () => data?.pages.flatMap((page) => page.data) ?? [],
        [data],
    );

    const selectedOption = useMemo(
        () =>
            options.find(
                (option) => getOptionValue(option) === value,
            ) ?? null,
        [options, value, getOptionValue],
    );

    const handleScroll = (
        event: React.UIEvent<HTMLUListElement>,
    ) => {
        const list = event.currentTarget;
        const nearBottom =
            list.scrollTop + list.clientHeight >=
            list.scrollHeight - 8;

        if (
            list.scrollTop > 0 &&
            nearBottom &&
            hasNextPage &&
            !isFetching &&
            !fetchingNextPageRef.current
        ) {
            fetchingNextPageRef.current = true;
            void fetchNextPage({ cancelRefetch: false }).finally(() => {
                fetchingNextPageRef.current = false;
            });
        }
    };

    return (
        <Autocomplete<T, false, false, false>
            {...autocompleteProps}
            options={options}
            value={selectedOption}
            inputValue={inputValue}
            loading={isLoading || isFetching}
            getOptionLabel={getOptionLabel}
            isOptionEqualToValue={(option, selected) =>
                getOptionValue(option) === getOptionValue(selected)
            }
            onInputChange={(_event, newInputValue, reason) => {
                setInputValue(newInputValue);
                if (reason === "input" || reason === "clear") {
                    setSearchInput(newInputValue);
                }
            }}
            onChange={(_event, option) => {
                setInputValue(option ? getOptionLabel(option) : "");
                setSearchInput("");
                onChange(
                    option ? getOptionValue(option) : null,
                    option,
                );
            }}
            slotProps={{
                listbox: {
                    onScroll: handleScroll,
                    sx: {
                        maxHeight: 280,
                        overflowY: "auto",
                    },
                },
            }}
            noOptionsText={
                isError
                    ? "Không thể tải dữ liệu"
                    : "Không tìm thấy dữ liệu"
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    {...textFieldProps}
                    label={label}
                    placeholder={placeholder}
                    helperText={
                        isError
                            ? "Tải dữ liệu thất bại. Vui lòng thử lại."
                            : helperText
                    }
                    error={Boolean(isError) || textFieldProps?.error}
                    slotProps={{
                        ...params.slotProps,
                        input: {
                            ...params.slotProps?.input,
                            endAdornment: (
                                <>
                                    {isLoading || isFetching ? (
                                        <CircularProgress color="inherit" size={18} />
                                    ) : null}
                                    {params.slotProps?.input?.endAdornment}
                                </>
                            ),
                        },
                    }}
                />
            )}
        />
    );
}
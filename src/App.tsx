import { useCallback, useState, useEffect } from 'react';
import { useMutation, useQuery, gql } from 'urql';

const limit = 5;

const ITEMS_QUERY = gql`
  query Items($first: Int!, $after: String) {
    items(first: $first, after: $after) {
      nodes {
        id
        name
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const REMOVE_ITEM_MUTATION = gql`
  mutation removeItem($id: ID!) {
    removeItem(id: $id)
  }
`;

type ItemsPageProps = {
  variables: { first: number; after?: string | null };
  onLoadMore: (cursor?: string | null) => void;
  isLastPage: boolean;
};

const ItemsPage = ({ variables, onLoadMore, isLastPage }: ItemsPageProps) => {
  const [{ data, fetching, error, stale }] = useQuery({
    query: ITEMS_QUERY,
    variables,
  });
  const items = data?.items;

  useEffect(() => {
    console.log('stale', stale);
  }, [stale]);

  useEffect(() => {
    console.log('items', items);
  }, [items]);

  const [, removeItem] = useMutation(REMOVE_ITEM_MUTATION);

  const handleClick = useCallback(
    async (id: string) => {
      await removeItem({ id });
    },
    [removeItem]
  );

  return (
    <div style={{ padding: 8 }}>
      {error && <p>Oh no... {error.message}</p>}

      {fetching && <p>Loading...</p>}

      {items && (
        <>
          <h1 style={{ marginBottom: 4 }}>Items</h1>
          <div className="grid grid-cols-2 gap-2" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {items.nodes.map((item: any) => (
              <div key={item.id}>
                <span>{item.name}</span>
                <button
                  onClick={() => handleClick(item.id)}
                >
                  X
                </button>
              </div>
            ))}

            {isLastPage && items.pageInfo.hasNextPage && (
              <button onClick={() => onLoadMore(items.pageInfo.endCursor)}>
                load more
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const PaginatedItems = () => {
  const [pageVariables, setPageVariables] = useState<
    { first: number; after?: string | null }[]
  >([{ first: limit, after: '' }]);

  return (
    <div>
      {pageVariables.map((variables, i) => (
        <ItemsPage
          key={'' + variables.after}
          variables={variables}
          isLastPage={i === pageVariables.length - 1}
          onLoadMore={(after) =>
            setPageVariables([...pageVariables, { after, first: limit }])
          }
        />
      ))}
    </div>
  );
};

export default PaginatedItems;

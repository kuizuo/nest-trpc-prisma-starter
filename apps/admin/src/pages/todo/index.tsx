import { addTodo, removeTodo, queryTodo, updateTodo } from '@/services/todo/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormSegmented,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage } from '@umijs/max';
import { Button, Drawer, message, Tag, Input, Space, InputRef } from 'antd';
import React, { useRef, useState } from 'react';

const statusValueEnum = {
  false: {
    text: '待完成',
    status: 'Default',
  },
  true: {
    text: '已完成',
    status: 'Success',
  },
}

const TagList: React.FC<{
  value?: {
    key: string;
    name: string;
  }[];
  onChange?: (
    value: {
      key: string;
      name: string;
    }[],
  ) => void;
}> = ({ value, onChange }) => {
  const ref = useRef<InputRef | null>(null);
  const [newTags, setNewTags] = useState<
    {
      key: string;
      name: string;
    }[]
  >([]);
  const [inputValue, setInputValue] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    let tempsTags = [...(value || [])];
    if (
      inputValue &&
      tempsTags.filter((tag) => tag.name === inputValue).length === 0
    ) {
      tempsTags = [
        ...tempsTags,
        { key: `new-${tempsTags.length}`, name: inputValue },
      ];
    }
    onChange?.(tempsTags);
    setNewTags([]);
    setInputValue('');
  };

  return (
    <Space>
      {(value || []).concat(newTags).map((item) => (
        <Tag key={item.key}>{item.name}</Tag>
      ))}
      <Input
        ref={ref}
        type="text"
        size="small"
        style={{ width: 78 }}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputConfirm}
        onPressEnter={handleInputConfirm}
      />
    </Space>
  );
};

const handleAdd = async (fields: API.TodoItem) => {
  const hide = message.loading('正在添加');
  try {
    await addTodo({ ...fields });
    hide();
    message.success('添加成功');
    return true;
  } catch (error) {
    hide();
    message.error('添加失败!');
    return false;
  }
};

const handleUpdate = async ({ id, ...fields }: API.TodoItem) => {
  const hide = message.loading('Configuring');
  try {
    await updateTodo(id, {
      ...fields
    });
    hide();

    message.success('更新成功');
    return true;
  } catch (error) {
    hide();
    message.error('更新失败');
    return false;
  }
};

const handleRemove = async (selectedRows: API.TodoItem[]) => {
  console.log("🚀 ~ handleRemove ~ selectedRows:", selectedRows)
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeTodo(selectedRows.map((row) => row.id));
    hide();
    message.success('删除成功');
    return true;
  } catch (error) {
    hide();

    return false;
  }
};

const TableList: React.FC = () => {
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.TodoItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.TodoItem[]>([]);

  const columns: ProColumns<API.TodoItem>[] = [
    {
      title: '代办事项',
      dataIndex: 'value',
      width: 180,
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },

    {
      title: '状态',
      dataIndex: 'status',
      hideInForm: true,
      width: 100,
      valueEnum: statusValueEnum,
    },
    {
      title: '创建时间',
      key: 'showTime',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      sorter: true,
      hideInSearch: true,
      width: 180
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateRange',
      hideInTable: true,
      hideInDescriptions: true,
      search: {
        transform: (value) => {
          return {
            startTime: value[0],
            endTime: value[1],
          };
        },
      },
    },
    // {
    //   title: '备注',
    //   dataIndex: 'remark',
    //   width: 150,
    // },
    {
      title: '创建者',
      dataIndex: 'user.username',
      width: 150,
      render: (dom, entity) => {
        return (<span>{entity.user.username}</span>)
      },
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      width: 80,
      render: (_, record) => [
        <a
          key="config"
          onClick={() => {
            handleUpdateModalOpen(true);
            setCurrentRow(record);
          }}
        >
          编辑
        </a>
      ],
    },
  ];

  return (
    <PageContainer header={{ title: 'Todo列表' }}>
      <ProTable<API.TodoItem, API.PageParams>
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        cardBordered
        // toolBarRender={() => [
        //   <Button
        //     type="primary"
        //     key="primary"
        //     onClick={() => {
        //       handleModalOpen(true);
        //     }}
        //   >
        //     <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
        //   </Button>,
        // ]}
        request={queryTodo}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="Chosen" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            <FormattedMessage
              id="pages.searchTable.batchDeletion"
              defaultMessage="Batch deletion"
            />
          </Button>
        </FooterToolbar>
      )}

      <ModalForm
        title={'更新todo'}
        width="400px"
        layout="horizontal"
        grid
        open={updateModalOpen}
        onOpenChange={handleUpdateModalOpen}
        modalProps={{ destroyOnClose: true }}
        initialValues={{
          value: currentRow?.value,
          status: currentRow?.status,
        }}
        onFinish={async (value) => {
          const success = await handleUpdate({ id: currentRow?.id, ...value });
          if (success) {
            handleUpdateModalOpen(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >

        <ProFormSegmented
          label={"状态"}
          colProps={{
            span: 24,
          }}
          name="status"
          valueEnum={statusValueEnum}
        />
      </ModalForm>

      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.value && (
          <ProDescriptions<API.TodoItem>
            column={1}
            title={currentRow?.value}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.id,
            }}
            columns={columns as ProDescriptionsItemProps<API.TodoItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;

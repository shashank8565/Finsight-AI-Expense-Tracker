import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Search, Plus, MoreVertical, Loader2, ChevronLeft, ChevronRight, Calendar, Edit2, Trash2, Download } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { transactionService, categoryService } from "../../api/services";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner";
import { exportExpensePdf } from "../../utils/exportExpensePdf";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const categoryColors: Record<string, string> = {
  Food: "bg-[#FF6B6B]/10 text-[#FF6B6B] border-[#FF6B6B]/20",
  Transport: "bg-[#C8FF00]/10 text-[#C8FF00] border-[#C8FF00]/20",
  Shopping: "bg-[#7B61FF]/10 text-[#7B61FF] border-[#7B61FF]/20",
  Bills: "bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/20",
  Entertainment: "bg-[#00E5A0]/10 text-[#00E5A0] border-[#00E5A0]/20",
  Health: "bg-[#4B9FFF]/10 text-[#4B9FFF] border-[#4B9FFF]/20",
  EMI: "bg-[#FF6B6B]/10 text-[#FF6B6B] border-[#FF6B6B]/20",
  Education: "bg-[#7B61FF]/10 text-[#7B61FF] border-[#7B61FF]/20",
};

const ITEMS_PER_PAGE = 15;

export function Expenses() {
  const queryClient = useQueryClient();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(() => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Parse month
  const [selYear, selMon] = selectedMonth.split('-').map(Number);
  const isCurrentMonth = selYear === now.getFullYear() && selMon === now.getMonth() + 1;

  const goToPrevMonth = () => {
    const d = new Date(selYear, selMon - 2, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    setPage(1);
  };
  const goToNextMonth = () => {
    if (!isCurrentMonth) {
      const d = new Date(selYear, selMon, 1);
      setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      setPage(1);
    }
  };

  // Compute date range for the selected month (use YYYY-MM-DD to avoid timezone issues)
  const daysInMonth = new Date(selYear, selMon, 0).getDate();
  const startDate = `${selYear}-${String(selMon).padStart(2, '0')}-01`;
  const endDate = `${selYear}-${String(selMon).padStart(2, '0')}-${daysInMonth}`;

  // Form state
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [merchant, setMerchant] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getCategories,
  });

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ["transactions", activeCategory, search, selectedMonth, page],
    queryFn: () =>
      transactionService.getTransactions({
        type: "expense",
        categoryId: activeCategory || undefined,
        search: search || undefined,
        startDate,
        endDate,
        page,
        limit: ITEMS_PER_PAGE,
      }),
  });

  const createMutation = useMutation({
    mutationFn: transactionService.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["expense-by-category"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsAddModalOpen(false);
      setAmount("");
      setDescription("");
      setMerchant("");
      setCategoryId("");
      toast.success("Expense added successfully");
    },
    onError: () => {
      toast.error("Failed to add expense");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: transactionService.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["expense-by-category"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Expense deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete expense");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; transactionData: any }) => transactionService.updateTransaction(data.id, data.transactionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["expense-by-category"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsAddModalOpen(false);
      setEditingExpense(null);
      toast.success("Expense updated successfully");
    },
    onError: () => {
      toast.error("Failed to update expense");
    }
  });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      type: "expense",
      amount: Number(amount),
      description,
      merchant,
      category: categoryId,
      date: new Date(date).toISOString(),
    };

    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense._id, transactionData: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setDescription("");
    setMerchant("");
    setAmount("");
    setCategoryId("");
    setDate(new Date().toISOString().split("T")[0]);
    setIsAddModalOpen(true);
  };

  const transactions = transactionsData?.data || [];
  const pagination = transactionsData?.pagination || { page: 1, pages: 1, total: 0, limit: ITEMS_PER_PAGE };
  const totalMonthExpense = transactions.reduce((s: number, t: any) => s + (t.amount || 0), 0);
  const filterCategories = [{ _id: null, name: "All" }, ...categories.filter((c: any) => c.type !== "income")];

  // Reset page when filters change
  const handleCategoryChange = (catId: string | null) => {
    setActiveCategory(catId);
    setPage(1);
  };
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      // Fetch ALL transactions for the selected month (no pagination limit)
      const allData = await transactionService.getTransactions({
        type: "expense",
        startDate,
        endDate,
        limit: 9999,
      });
      const allTransactions = allData?.data || [];
      if (allTransactions.length === 0) {
        toast.error("No expenses to export for this month");
        return;
      }
      const monthLabel = `${MONTH_NAMES[selMon - 1]} ${selYear}`;
      await exportExpensePdf(allTransactions, monthLabel);
      toast.success(`Report exported: ${monthLabel}`);
    } catch (err) {
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-[32px] sm:text-[40px] font-bold text-white">Expenses</h1>
          {/* Month Selector */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2 backdrop-blur-xl">
            <button onClick={goToPrevMonth} className="p-1 rounded-lg hover:bg-white/10 transition-all text-white/60 hover:text-white">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 min-w-[130px] justify-center">
              <Calendar className="w-3.5 h-3.5 text-[#C8FF00]" />
              <span className="text-white font-medium text-sm">
                {MONTH_NAMES[selMon - 1].slice(0, 3)} {selYear}
              </span>
              {isCurrentMonth && (
                <span className="text-[9px] px-1.5 py-0.5 bg-[#C8FF00]/10 text-[#C8FF00] rounded-full font-medium">Now</span>
              )}
            </div>
            <button
              onClick={goToNextMonth}
              disabled={isCurrentMonth}
              className={`p-1 rounded-lg transition-all ${isCurrentMonth ? 'text-white/20 cursor-not-allowed' : 'hover:bg-white/10 text-white/60 hover:text-white'}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-white/60">
            <span className="text-white font-bold">{pagination.total}</span> expense{pagination.total !== 1 ? 's' : ''}
          </div>
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export PDF
          </button>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <button onClick={handleOpenAddModal} className="flex items-center justify-center gap-2 px-6 py-3 bg-[#C8FF00] text-[#0A0A0F] rounded-xl font-semibold hover:bg-[#d4ff33] transition-all">
              <Plus className="w-5 h-5" />
              Add Expense
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#12121A] border-white/10 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{editingExpense ? "Edit Expense" : "Add Expense"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddExpense} className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-white/60 mb-2 block">Description</label>
                <input
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  type="text"
                  placeholder="e.g., Lunch at cafe"
                  className="w-full h-[44px] px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#C8FF00]"
                />
              </div>

              <div>
                <label className="text-sm text-white/60 mb-2 block">Merchant (Optional)</label>
                <input
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  type="text"
                  placeholder="e.g., Swiggy, Amazon, Uber"
                  className="w-full h-[44px] px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#C8FF00]"
                />
              </div>

              <div>
                <label className="text-sm text-white/60 mb-2 block">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">₹</span>
                  <input
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="number"
                    min="1"
                    placeholder="0"
                    className="w-full h-[44px] pl-8 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#C8FF00]"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-white/60 mb-2 block">Category</label>
                <Select value={categoryId} onValueChange={setCategoryId} required>
                  <SelectTrigger className="w-full h-[44px] px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#C8FF00] focus-visible:border-[#C8FF00]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#12121A] border-white/10 text-white">
                    {categories.filter((c: any) => c.type !== "income").map((cat: any) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        <div className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-white/60 mb-2 block">Date</label>
                <input
                  required
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-[44px] px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#C8FF00]"
                />
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full py-3 mt-2 bg-[#C8FF00] text-[#0A0A0F] rounded-xl font-semibold hover:bg-[#d4ff33] transition-all flex items-center justify-center gap-2"
              >
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingExpense ? "Update Expense" : "Save Expense"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search expenses..."
            className="w-full h-[44px] pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 backdrop-blur-xl focus:outline-none focus:border-[#C8FF00]"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {filterCategories.map((cat: any) => (
            <button
              key={cat._id || 'all'}
              onClick={() => handleCategoryChange(cat._id)}
              className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                activeCategory === cat._id
                  ? "bg-[#C8FF00] text-[#0A0A0F]"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[20px] p-6">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#C8FF00]" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center text-white/60">
            No expenses found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/60 pb-3 font-semibold min-w-[120px]">Date</th>
                  <th className="text-left text-white/60 pb-3 font-semibold min-w-[200px]">Description</th>
                  <th className="text-left text-white/60 pb-3 font-semibold min-w-[120px]">Category</th>
                  <th className="text-right text-white/60 pb-3 font-semibold min-w-[100px]">Amount</th>
                  <th className="text-right text-white/60 pb-3 font-semibold w-12"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((expense: any) => (
                  <tr key={expense._id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 text-white/80">{format(new Date(expense.date), "MMM dd, yyyy")}</td>
                    <td className="py-4 text-white font-medium">{expense.description}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${categoryColors[expense.category?.name] || "bg-white/10 text-white border-white/20"}`}>
                        {expense.category?.icon} {expense.category?.name}
                      </span>
                    </td>
                    <td className="py-4 text-right text-[#FF6B6B] font-semibold">₹{(expense.amount || 0).toLocaleString()}</td>
                    <td className="py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/60 hover:text-white">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#12121A] border-white/10 text-white">
                          <DropdownMenuItem 
                            onClick={() => {
                              setEditingExpense(expense);
                              setDescription(expense.description);
                              setMerchant(expense.merchant || "");
                              setAmount(expense.amount.toString());
                              setCategoryId(expense.category?._id || expense.category);
                              setDate(new Date(expense.date).toISOString().split("T")[0]);
                              setIsAddModalOpen(true);
                            }}
                            className="flex items-center gap-2 cursor-pointer focus:bg-white/5 focus:text-[#C8FF00]"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeleteExpenseId(expense._id)}
                            className="flex items-center gap-2 cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10 mt-4">
            <div className="text-sm text-white/50">
              Showing {((page - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(page * ITEMS_PER_PAGE, pagination.total)} of {pagination.total} expenses
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${page === 1 ? 'text-white/20 cursor-not-allowed' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'}`}
              >
                ← Prev
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.pages || Math.abs(p - page) <= 1)
                .reduce<(number | string)[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  typeof p === 'string' ? (
                    <span key={`dots-${idx}`} className="px-2 text-white/30 text-sm">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                        page === p
                          ? 'bg-[#C8FF00] text-[#0A0A0F]'
                          : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${page === pagination.pages ? 'text-white/20 cursor-not-allowed' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'}`}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!deleteExpenseId} onOpenChange={(open) => !open && setDeleteExpenseId(null)}>
        <DialogContent className="bg-[#12121A] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Delete Expense
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-white/80">Are you sure you want to delete this expense? This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button 
              onClick={() => setDeleteExpenseId(null)}
              className="px-4 py-2 rounded-xl font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all border border-white/10"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                if (deleteExpenseId) {
                  deleteMutation.mutate(deleteExpenseId);
                  setDeleteExpenseId(null);
                }
              }}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all flex items-center gap-2"
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

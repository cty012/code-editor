public class ThreadSecurityManager extends SecurityManager { 

    private static ThreadGroup rootGroup;

    @Override
    public ThreadGroup getThreadGroup() {
        if (rootGroup == null) {
            rootGroup = getRootGroup();
        }
        return rootGroup;
    }

    private static ThreadGroup getRootGroup() {
        ThreadGroup root = Thread.currentThread().getThreadGroup();
        while (root.getParent() != null) {
            root = root.getParent();
        }
        return root;
    }
}
